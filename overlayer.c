#define WIN32_LEAN_AND_MEAN
#include <dwmapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <windows.h>

#pragma comment(lib, "user32.lib")
#pragma comment(lib, "dwmapi.lib")

#define DEFAULT_TRANSPARENCY 230
#define LESS_TRANSPARENCY 40

#define TOGGLE_KEY VK_LWIN
#define WINDOW_KEY VK_ESCAPE

HHOOK hHook = NULL;
HWND hControlledWindow = NULL;

void AdjustWindowProperties(HWND hwnd) {
  COLORREF color = DWMWA_COLOR_NONE;
  DwmSetWindowAttribute(hwnd, DWMWA_BORDER_COLOR, &color, sizeof(color));
  LONG_PTR exStyle = GetWindowLongPtr(hwnd, GWL_EXSTYLE);
  SetWindowLongPtr(hwnd, GWL_EXSTYLE, exStyle | WS_EX_LAYERED);
  SetLayeredWindowAttributes(hwnd, 0, DEFAULT_TRANSPARENCY, LWA_ALPHA);
  SetWindowPos(hwnd, HWND_TOPMOST, 0, 0, 0, 0,
               SWP_NOMOVE | SWP_NOSIZE | SWP_FRAMECHANGED);
}

void RevertWindowProperties(HWND hwnd) {
  LONG_PTR exStyle = GetWindowLongPtr(hwnd, GWL_EXSTYLE);
  SetWindowLongPtr(hwnd, GWL_EXSTYLE, exStyle & ~WS_EX_LAYERED);
  SetLayeredWindowAttributes(hwnd, 0, 255, LWA_ALPHA);
  SetWindowPos(hwnd, HWND_NOTOPMOST, 0, 0, 0, 0,
               SWP_NOMOVE | SWP_NOSIZE | SWP_FRAMECHANGED);
}

void SwitchTransparency(HWND hwnd) {
  LONG_PTR exStyle = GetWindowLongPtr(hwnd, GWL_EXSTYLE);
  if (exStyle & WS_EX_TRANSPARENT) {
    SetWindowLongPtr(hwnd, GWL_EXSTYLE, exStyle & ~WS_EX_TRANSPARENT);
    SetLayeredWindowAttributes(hwnd, 0, DEFAULT_TRANSPARENCY, LWA_ALPHA);
  } else {
    SetWindowLongPtr(hwnd, GWL_EXSTYLE, exStyle | WS_EX_TRANSPARENT);
    SetLayeredWindowAttributes(hwnd, 0, LESS_TRANSPARENCY, LWA_ALPHA);
  }
}

int gKeyPressed = 0;
LRESULT CALLBACK KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
  if (wParam == WM_KEYUP) {
    KBDLLHOOKSTRUCT* pKeyboard = (KBDLLHOOKSTRUCT*)lParam;
    if (pKeyboard->vkCode == TOGGLE_KEY) {
      if (hControlledWindow != NULL && IsWindow(hControlledWindow)) {
        SwitchTransparency(hControlledWindow);
      }
      gKeyPressed = 0;
      return 1;
    }
  }
  if (wParam == WM_KEYDOWN) {
    KBDLLHOOKSTRUCT* pKeyboard = (KBDLLHOOKSTRUCT*)lParam;
    if (pKeyboard->vkCode == TOGGLE_KEY) {
      gKeyPressed = 1;
      return 1;
    }
    if (gKeyPressed && pKeyboard->vkCode == WINDOW_KEY) {
      if (hControlledWindow != NULL && IsWindow(hControlledWindow)) {
        RevertWindowProperties(hControlledWindow);
        hControlledWindow = NULL;
      } else {
        hControlledWindow = GetForegroundWindow();
        if (hControlledWindow != NULL) {
          AdjustWindowProperties(hControlledWindow);
        }
      }
    }
  }
  return CallNextHookEx(hHook, nCode, wParam, lParam);
}

void InstallHook() {
  hHook =
      SetWindowsHookEx(WH_KEYBOARD_LL, KeyboardProc, GetModuleHandle(NULL), 0);
  if (hHook == NULL) {
    printf("Failed to install hook! Error: %lu\n", GetLastError());
    exit(1);
  }
  printf("Hook installed successfully!\n");
}

void UninstallHook() {
  if (hHook) {
    UnhookWindowsHookEx(hHook);
    hHook = NULL;
    printf("Hook uninstalled successfully!\n");
  }
}

int main() {
  InstallHook();
  MSG msg;
  while (GetMessage(&msg, NULL, 0, 0)) {
    TranslateMessage(&msg);
    DispatchMessage(&msg);
  }
  UninstallHook();
  return 0;
}

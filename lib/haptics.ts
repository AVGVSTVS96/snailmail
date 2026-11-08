export const tap = (milliseconds: number) => {
  if ("vibrate" in navigator) {
    navigator.vibrate(milliseconds);

    return;
  }

  // iOS Safari has no Vibration API, but toggling a switch input plays the system haptic (iOS 18+).
  const label = document.createElement("label");
  const input = document.createElement("input");

  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.style.display = "none";
  label.append(input);
  document.body.append(label);
  label.click();
  label.remove();
};

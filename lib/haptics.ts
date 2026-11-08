const vibrate = (milliseconds: number) => {
  navigator.vibrate(milliseconds);
};

const toggleIosSwitch = () => {
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

export const tap = (milliseconds: number) => {
  if ("vibrate" in navigator) {
    vibrate(milliseconds);

    return;
  }

  toggleIosSwitch();
};

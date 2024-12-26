const slider = document.getElementById('slider');
const output = document.getElementById('output');
const checkbox = document.getElementById('checkbox');

function updateOutputPosition()
{
    const sliderRect = slider.getBoundingClientRect();
    const thumbPosition = (slider.value - slider.min) / (slider.max - slider.min);
    const outputWidth = output.offsetWidth;
    const thumbOffset = thumbPosition * (sliderRect.width - 24); // 24px is thumb width

    // Center the output horizontally over the handle
    const centerOffset = thumbOffset + (sliderRect.left + 12); // 12px is half of thumb width

    output.style.left = `${centerOffset - (outputWidth / 2)}px`; // Center the output horizontally
    output.style.top = `${sliderRect.top - 50}px`; // Position the output above the slider

    // Make the left background of the slider end at (around) the center of the handle
    slider.style.setProperty('--slider-value', (thumbPosition * sliderRect.width) + (thumbPosition < 0.5 ? 5 : -5));
}


chrome.runtime.sendMessage({ message: 'init_popup' }, (response) =>
{
    checkbox.checked = response.enabled;
    slider.disabled = !checkbox.checked;
    slider.value = response.volume;
    output.innerHTML = slider.value + "x";
    updateOutputPosition();
});

slider.oninput = function ()
{
    output.innerHTML = this.value + "x";
    updateOutputPosition();
    chrome.runtime.sendMessage({ message: "sliderchange", value: slider.value });
};

checkbox.onchange = function ()
{
    slider.disabled = !checkbox.checked;
    chrome.runtime.sendMessage({ message: "enabled", value: checkbox.checked });
    chrome.runtime.sendMessage({ message: "sliderchange", value: slider.value });
};

// Update position on window resize
window.addEventListener('resize', updateOutputPosition);

// Initial position update
updateOutputPosition();
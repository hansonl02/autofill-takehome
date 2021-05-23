const AUTOFILL_DATA_FILE = chrome.runtime.getURL('data.json');
const SELECTOR_MAPPING_FILE = chrome.runtime.getURL('selectors.json');

let data = {};
let selectors = {};

const job_url =
  "https://boards.greenhouse.io/simplifyjobsintegrationsandbox/jobs/4344358003";

const dataStream = fetch(AUTOFILL_DATA_FILE)
  .then(response => response.json())
  .catch(e => console.log(`failed to read data.json: ${e}`));

const selectorsStream = fetch(SELECTOR_MAPPING_FILE)
  .then(response => response.json())
  .catch(e => console.log(`failed to read selectors.json: ${e}`));

Promise.all([
  dataStream,
  selectorsStream
]).then(responses => {
  data = responses[0];
  selectors = responses[1];
  fillBoard();
})

function fillBoard() {
  for (let selector in selectors) {
    const inputElement = $(selector);
    if (inputElement.length) {
      const inputData = selectors[selector];
      const inputValue = data[inputData];
      inputElement.each(element => {
        if (inputElement[element].tagName === 'SELECT') {
          $(selector).click();
          $(`${selector} option:contains("${inputValue}")`).attr("selected", true);
          var e = jQuery.Event("keydown");
          e.which = 13;
          e.keyCode = 13;
          $(selector).trigger(e);
          console.log("pressed " + inputValue);
        } else {
          $(selector).val(inputValue).change();
        }
      });
    }
  }
}

$( document ).ready(function() {
  $( "#first_name" ).focus();
});

fillBoard()

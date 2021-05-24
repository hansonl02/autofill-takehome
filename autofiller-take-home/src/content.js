/* Heavily referenced from https://github.com/lovincyrus/job-autofiller */

// JSON filenames
const AUTOFILL_DATA_FILE = chrome.runtime.getURL('data.json');
const SELECTOR_MAPPING_FILE = chrome.runtime.getURL('selectors.json');

// Autofill data
let data = {};
// Mapping of input field name to the corresponding key in the data JSON
let selectors = {};

const job_url =
  "https://boards.greenhouse.io/simplifyjobsintegrationsandbox/jobs/4344358003";

// Retrieve JSON data
const dataStream = fetch(AUTOFILL_DATA_FILE)
  .then(response => response.json());
const selectorsStream = fetch(SELECTOR_MAPPING_FILE)
  .then(response => response.json());

Promise.all([
  dataStream,
  selectorsStream
]).then(responses => {
  data = responses[0];
  selectors = responses[1];
  fillBoard();
})

async function fillBoard() {
  /* For each selector on the greenhouse form mapped in selectors.json, identify
   * if it is a basic text input or a dropdown, then fill accordingly */

  let dropdowns = [];
  for (let selector in selectors) {
    const inputElement = $(selector);
    if (inputElement.length) {
      const inputData = selectors[selector];
      const inputValue = data[inputData];
      // TODO: handle school field
      inputElement.each(element => {
        if (inputElement[element].tagName === 'SELECT') {
          $(`${selector} option:contains("${inputValue}")`).attr("selected", true);
          // dropdowns.push(inputData);
          // TODO: figure out how to actually set the selected value
          /* I attempted to trigger a 'change' event as several online sources
           * have suggested but it doesn't seem to work */
          // $(selector).trigger('change');
        } else {
          $(selector).val(inputValue).change();
        }
      });
    }
  }

  for (let selector in dropdowns) {
    console.log(selector);
    const inputElement = $(selector);
    inputElement.focus();
    var e = jQuery.Event("keydown");
    e.which = 13;
    e.key = 13;
    inputElement.trigger(e);
  }

  // TODO: figure out entire file download/upload process
  // https://stackoverflow.com/questions/13333378/how-can-javascript-upload-a-blob
  $.get(data.resume).then(function(resume) {
    var blob = new Blob([resume], { type: 'pdf' });
    var hidden_elem = document.getElementsByName("file");
    console.log(document.getElementsByName("file"));
    // hidden_elem.value = blob;
  });
};

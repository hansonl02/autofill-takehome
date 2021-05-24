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

  for (let selector in selectors) {
    const inputElement = $(selector);
    if (inputElement.length) {
      const inputData = selectors[selector];
      const inputValue = data[inputData];
      // TODO: handle school field
      inputElement.each(element => {
        if (inputElement[element].tagName === 'SELECT') {
          $(`${selector} option:contains("${inputValue}")`).attr("selected", true);
          // TODO: figure out how to actually set the selected value
          /* I attempted to trigger a 'change' event as several online sources
           * have suggested but it doesn't have the intended effect. Also
           * have been playing around with select2. */
          // var e = jQuery.Event("keydown");
          // e.which = 13;
          // e.keyCode = 13;
          // $(selector).select2().trigger(e);
          // $(selector).select2().trigger("select2:open");
          $(selector).select2().trigger('change');
        } else {
          $(selector).val(inputValue).change();
        }
      });
    }
    // $("[name='job_application[educations][][degree_id]']").trigger("change");
    // $("[name='job_application[educations][][degree_id]']").trigger('select');
  }

  // TODO: figure out entire file download/upload process
  // Error: No 'Access-Control-Allow-Origin' header is present on the requested resource.
  $.get(data.resume).then(function(resume) {
    var blob = new Blob([resume], { type: 'application/pdf' });
    var hidden_elem = document.getElementById("s3_upload_for_resume");
    hidden_elem.value = blob;
  });
};

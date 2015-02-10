// Add a reference entry to the end of a document. Call the published
// URL for this script (see Publish menu) via HTTP with a docId and
// referenceText to add a reference to that document.
//
// The references are added to a table with the heading
// "Content Push References" at the end of the document.

var REFERENCES_HEADING = 'Content Push References';

function getReferencesSection(doc) {
  var body = doc.getBody();
  var searchType = DocumentApp.ElementType.TABLE;
  var searchResult = null;
  var searchRegex = new RegExp(REFERENCES_HEADING, 'm');
  var table;
  var row;
  var cell;

  while (searchResult = body.findElement(searchType, searchResult)) {
    table = searchResult.getElement().asTable();

    row = table.getRow(0);
    if (row) {
      cell = row.getCell(0);
    }

    matches = false;
    if (cell) {
      matches = (cell.getText() === REFERENCES_HEADING);
    }

    if (matches) {
      return table;
    }
  }

  return null;
}

function addReference(doc, referenceText) {
  var row;
  var cell;
  var attrs = {};
  var counter;
  var numRows;
  var lastRow;

  var refSection = getReferencesSection(doc);
  if (!refSection) {
    refSection = doc.getBody().appendTable();
    row = refSection.appendTableRow();
    cell = row.appendTableCell(REFERENCES_HEADING);
    cell.setPaddingLeft(0);
    cell.setPaddingRight(0);
    attrs[DocumentApp.Attribute.BOLD] = true;
    cell.setAttributes(attrs);
  }
  refSection.setBorderWidth(0);

  // get the number from the last row
  numRows = refSection.getNumRows();

  counter = null;

  // first row in the table is the heading, so ignore it
  if (numRows > 1) {
    var counterText = refSection.getRow(numRows - 1).getCell(0).getText();
    var matches = counterText.match(/^(\d+)\. /);

    if (matches) {
      counter = parseInt(matches[1], 10) + 1;
    }
  }

  if (counter === null) {
    counter = 1;
  }

  row = refSection.appendTableRow();
  cell = row.appendTableCell('' + counter + '. ' + referenceText);
  cell.setPaddingLeft(0);
  cell.setPaddingRight(0);
  attrs[DocumentApp.Attribute.BOLD] = false;
  cell.setAttributes(attrs);

  return counter;
}

function doGet(e) {
  var returnVal = {};
  var errors = [];

  // validate request parameters
  var docId = e.parameter.docId;
  var referenceText = e.parameter.referenceText;

  if (!docId) {
    errors.push('No docId parameter passed');
  }

  if (!referenceText) {
    errors.push('No referenceText parameter passed');
  }

  if (errors.length) {
    returnVal = {
      status: 'ERROR',
      errors: errors,
      originalRequest: e
    };
  } else {
    var doc = DocumentApp.openById(docId);
    var refNumber = addReference(doc, referenceText);

    returnVal = {
      status: 'OK',
      docId: docId,
      referenceText: referenceText,
      refNumber: refNumber
    };
  }

  var json = JSON.stringify(returnVal, null, 2);
  var out = ContentService.createTextOutput(json);
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

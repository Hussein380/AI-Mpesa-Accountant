const fs = require('fs');
const path = require('path');

// Path to the file
const filePath = path.join(__dirname, 'src', 'services', 'contextEnrichment.service.js');

// Read the file
fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  // Replace problematic code
  const fixedData = data.replace(
    /query\.amount\s*=\s*{};/g,
    'if (amountThresholds && (amountThresholds.min !== undefined || amountThresholds.max !== undefined)) { query.amount = {}; }'
  );

  // Write the fixed file
  fs.writeFile(filePath, fixedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing file:', err);
      return;
    }
    console.log('Successfully fixed contextEnrichment.service.js');
  });
}); 
// scripts/prebuild.js
// Converts YAML detection rules to JSON for the web app

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const RULES_DIR = path.join(__dirname, '../rules');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const RULES_OUTPUT = path.join(OUTPUT_DIR, 'rules.json');
const INDEX_OUTPUT = path.join(OUTPUT_DIR, 'index.json');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Recursively find all YAML files in a directory
 */
function findYamlFiles(dir) {
  let yamlFiles = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return yamlFiles;
  }
  
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      yamlFiles = yamlFiles.concat(findYamlFiles(filePath));
    } else if (file.endsWith('.yml') || file.endsWith('.yaml')) {
      yamlFiles.push(filePath);
    }
  });

  return yamlFiles;
}

/**
 * Parse a single YAML rule file
 */
function parseRuleFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const rule = yaml.load(content);
    
    // Add metadata
    rule.id = rule.id || path.basename(filePath, path.extname(filePath));
    rule.file_path = path.relative(RULES_DIR, filePath);
    
    return rule;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Build filter index from all rules
 */
function buildFilterIndex(rules) {
  const index = {
    total_rules: rules.length,
    filters: {}
  };

  // Extract all unique values for each filterable field
  const filterFields = [
    'domain', 'type', 'os', 'use_cases', 'tactics', 
    'data_sources', 'language', 'severity'
  ];

  filterFields.forEach(field => {
    const values = new Set();
    
    rules.forEach(rule => {
      const value = rule[field];
      if (Array.isArray(value)) {
        value.forEach(v => values.add(v));
      } else if (value) {
        values.add(value);
      }
    });

    // Count rules for each value
    index.filters[field] = Array.from(values).sort().map(value => ({
      value,
      count: rules.filter(rule => {
        const ruleValue = rule[field];
        if (Array.isArray(ruleValue)) {
          return ruleValue.includes(value);
        }
        return ruleValue === value;
      }).length
    }));
  });

  return index;
}

/**
 * Main processing function
 */
async function processRules() {
  console.log('🔍 Searching for YAML rules...');
  
  if (!fs.existsSync(RULES_DIR)) {
    console.error(`❌ Rules directory not found: ${RULES_DIR}`);
    console.log('💡 Create a "rules" directory and add your YAML files');
    console.log('💡 Or run: git submodule update --init --recursive');
    process.exit(1);
  }

  const yamlFiles = findYamlFiles(RULES_DIR);
  console.log(`📄 Found ${yamlFiles.length} YAML files`);

  if (yamlFiles.length === 0) {
    console.warn('⚠️  No YAML files found in rules directory');
  }

  // Parse all rules
  console.log('🔄 Parsing rules...');
  const rules = yamlFiles
    .map(parseRuleFile)
    .filter(rule => rule !== null);

  console.log(`✅ Successfully parsed ${rules.length} rules`);

  // Build filter index
  console.log('📊 Building filter index...');
  const index = buildFilterIndex(rules);

  // Write outputs
  console.log('💾 Writing output files...');
  fs.writeFileSync(RULES_OUTPUT, JSON.stringify(rules, null, 2));
  fs.writeFileSync(INDEX_OUTPUT, JSON.stringify(index, null, 2));

  console.log(`✨ Done!`);
  console.log(`   - Rules: ${RULES_OUTPUT} (${rules.length} rules)`);
  console.log(`   - Index: ${INDEX_OUTPUT}`);
  console.log(`   - Total size: ${((JSON.stringify(rules).length + JSON.stringify(index).length) / 1024).toFixed(2)} KB`);

  // Print summary
  console.log('\n📈 Summary:');
  Object.entries(index.filters).forEach(([field, values]) => {
    if (values.length > 0) {
      console.log(`   ${field}: ${values.length} unique values`);
    }
  });
}

// Run the script
processRules().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
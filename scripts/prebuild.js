const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const RULES_DIR = path.join(__dirname, '../rules');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const RULES_OUTPUT = path.join(OUTPUT_DIR, 'rules.json');
const INDEX_OUTPUT = path.join(OUTPUT_DIR, 'index.json');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

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

function parseRuleFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const rule = yaml.load(content);
    rule.id = rule.id || path.basename(filePath, path.extname(filePath));
    rule.file_path = path.relative(RULES_DIR, filePath);
    return rule;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

function buildFilterIndex(rules) {
  const index = {
    total_rules: rules.length,
    filters: {}
  };

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

async function processRules() {
  console.log('🔍 Searching for YAML rules...');
  
  if (!fs.existsSync(RULES_DIR)) {
    console.error(`❌ Rules directory not found: ${RULES_DIR}`);
    console.log('💡 Run: git submodule update --init --recursive');
    process.exit(1);
  }

  const yamlFiles = findYamlFiles(RULES_DIR);
  console.log(`📄 Found ${yamlFiles.length} YAML files`);

  if (yamlFiles.length === 0) {
    console.warn('⚠️  No YAML files found in rules directory');
  }

  const rules = yamlFiles
    .map(parseRuleFile)
    .filter(rule => rule !== null);

  console.log(`✅ Successfully parsed ${rules.length} rules`);

  const index = buildFilterIndex(rules);

  fs.writeFileSync(RULES_OUTPUT, JSON.stringify(rules, null, 2));
  fs.writeFileSync(INDEX_OUTPUT, JSON.stringify(index, null, 2));

  console.log(`✨ Done!`);
  console.log(`   - Rules: ${RULES_OUTPUT} (${rules.length} rules)`);
  console.log(`   - Index: ${INDEX_OUTPUT}`);
  
  console.log('\n📈 Summary:');
  Object.entries(index.filters).forEach(([field, values]) => {
    if (values.length > 0) {
      console.log(`   ${field}: ${values.length} unique values`);
    }
  });
}

processRules().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});

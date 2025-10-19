# Detection Rules

Threat detection rules in YAML format for security monitoring and threat hunting.

## 📁 Structure

```
rules/
├── windows/         # Windows-specific rules
│   ├── execution/
│   ├── persistence/
│   ├── privilege_escalation/
│   └── defense_evasion/
├── linux/           # Linux-specific rules
│   ├── execution/
│   ├── persistence/
│   └── credential_access/
├── cloud/           # Cloud platform rules
│   ├── aws/
│   ├── azure/
│   └── gcp/
└── network/         # Network-based rules
```

## 🌐 Rule Explorer

Browse all rules interactively: **https://YOUR-USERNAME.github.io/detection-rules-explorer**

## 📝 Rule Format

Each rule is a YAML file with the following structure:

### Required Fields
- `id`: Unique identifier (e.g., rule-2024-001)
- `name`: Rule name
- `description`: What the rule detects
- `severity`: low, medium, high, critical
- `type`: query, threshold, eql, ml
- `domain`: endpoint, network, cloud, web

### Recommended Fields
- `author`: Who created the rule
- `created`: Creation date (YYYY-MM-DD)
- `updated`: Last update date (YYYY-MM-DD)
- `os`: Array of operating systems ([windows, linux, macos, cloud])
- `tactics`: MITRE ATT&CK tactics
- `techniques`: MITRE ATT&CK technique IDs
- `data_sources`: Required data sources
- `use_cases`: Use case tags
- `language`: Query language (kuery, kql, lucene, eql)
- `enabled`: true/false
- `query`: Detection query
- `false_positives`: Known false positive scenarios
- `risk_score`: 0-100

## 📋 Example Rule

```yaml
id: rule-2024-001
name: Suspicious PowerShell Execution
description: Detects PowerShell with encoded commands
author: Security Team
created: 2024-01-15
updated: 2024-10-19
severity: high
type: query
domain: endpoint
language: kuery
tactics:
  - execution
  - defense_evasion
os:
  - windows
data_sources:
  - process
  - command_line
use_cases:
  - threat_detection
enabled: true
query: |
  process where event.type == "start" and
  process.name : ("powershell.exe", "pwsh.exe") and
  process.command_line : ("*-encodedcommand*", "*-enc*")
risk_score: 73
```

## 🤝 Contributing

1. Fork this repository
2. Create a new rule file in the appropriate directory
3. Follow the YAML format above
4. Test your rule
5. Submit a pull request

### Rule Naming Convention
- Use descriptive, lowercase names with underscores
- Format: `action_target_modifier.yml`
- Examples:
  - `suspicious_powershell_encoded.yml`
  - `ssh_brute_force_attempt.yml`
  - `s3_bucket_public_access.yml`

## 🔍 Testing Rules

Before submitting:
1. Validate YAML syntax
2. Ensure all required fields are present
3. Test the detection logic in your environment
4. Document any known false positives

## 📚 Resources

- [MITRE ATT&CK Framework](https://attack.mitre.org/)
- [Elastic Detection Rules](https://github.com/elastic/detection-rules)
- [Sigma Rules](https://github.com/SigmaHQ/sigma)

## 📄 License

Apache-2.0

## 📞 Contact

For questions or suggestions, please open an issue in this repository.
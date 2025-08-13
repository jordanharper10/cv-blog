var express = require('express');
var router = express.Router();

router.get('/', function (_req, res) {
  res.json({
    name: 'Jordan Harper',
    title: 'Network Automation Engineer',
    location: 'Manchester, UK / Remote',
    summary:
      '8+ Years Experience in IT & Network Automation<br><br>BSc (1st) in Cyber Security<br><br>Check out my coding work <a href="https://tools.jordan-harper.co.uk"> here</a>',
    skills: [
      'DevNet Professional', 'CCNP Enterprise',
      'Python: OOO, Django, Flask, Netmiko...',
      'Ansible', 'Linux', 'CI/CD',
      'Network Tooling: Itential, NetBox, NetBrain, SolarWinds, SD-A/WAN'
    ],
    contact: {
      email: 'master@jordan-harper.co.uk',
      linkedin: 'https://linkedin.com/in/jordanharper10',
      github: 'https://github.com/jordanharper10' 
    }
  });
});

module.exports = router;

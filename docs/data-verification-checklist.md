# Data verification checklist (the human does this, not Claude)

Claude Code appends here every item it could not verify. Before the demo, the user opens each official source, fixes `data/schemes.json`, sets `verified: true` and `last_verified` to the date checked.

For each scheme confirm:
- [ ] Official name and current eligibility rules
- [ ] Benefit amount/wording
- [ ] Required documents
- [ ] Official apply URL and source URL
- [ ] posted_date and last_date (null if open all year)

Suggested official sources: myscheme.gov.in, pmkisan.gov.in, scholarships.gov.in, udyamregistration.gov.in, startupindia.gov.in, Assam government portals.

## Items logged by Claude Code
(append below)

### Farmer schemes (6)
- **pm-kisan**: Verify eligibility rules (land ceiling, exclusion criteria), benefit amount, apply URL, source URL
- **pm-fasal-bima**: Verify premium rates per crop/season, enrollment windows, covered crops in Assam, apply portal
- **kisan-credit-card**: Verify interest rates, subvention rules, credit limit calculation, participating banks in Assam
- **soil-health-card**: Verify testing parameters, frequency, application process in Assam
- **pm-kusum**: Verify subsidy percentages, state nodal agency in Assam, pump capacity limits, application process
- **national-mission-edible-oils**: Verify subsidy components, eligible districts in Assam, soil/climate requirements

### Student schemes (6)
- **central-sector-scholarship**: Verify income ceiling, percentage cutoff, eligible courses/institutions, NSP timeline
- **post-matric-scholarship**: Verify income ceilings per category, maintenance allowance rates, Assam deadline, portal
- **pre-matric-scholarship**: Verify allowance rates, income ceilings, Assam application process
- **pm-vidyalaxmi**: Verify loan limit, interest subvention rules, eligible institutions, participating banks
- **nijut-moina**: Verify stipend amounts, eligible institutions, age limits, Assam education dept process
- **minority-merit-scholarship**: Verify eligible courses, community certificate format, income ceiling, NSP timeline

### Business schemes (6)
- **pm-mudra**: Verify loan categories, interest rates, eligible activities, lenders in Assam
- **stand-up-india**: Verify loan terms, eligible sectors, promoter contribution, bank application process
- **pm-egp**: Verify subsidy rates per category/region, eligible activities, Assam application process
- **cgtmse**: Verify guarantee cover percentages, fee structure, eligible lenders, MSE definition
- **startup-india**: Verify tax exemption rules, DPIIT recognition criteria, Fund of Funds access
- **pm-vishwakarma**: Verify 18 trades list, loan terms, training partners in Assam, application process

### Demo schemes (3)
- **demo-farmer-scheme**: Demo only — no verification needed
- **demo-student-scheme**: Demo only — no verification needed
- **demo-business-scheme**: Demo only — no verification needed

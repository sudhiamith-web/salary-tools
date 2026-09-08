# Glossary

Indian tax and HR terms used throughout the codebase, comments, and this
documentation — for a maintainer without prior domain background.

| Term | Meaning |
|---|---|
| **80C, 80D, 80CCD(1B)** | Sections of the Income Tax Act allowing deductions from taxable income for specific categories of spending/investment (80C: PPF, ELSS, insurance, etc.; 80D: health insurance premiums; 80CCD(1B): NPS contributions). Numbers refer to the section number in the Act. |
| **Advance tax** | Income tax paid in installments through the financial year (rather than as a lump sum at filing time), required once net tax liability crosses ₹10,000. |
| **AY (Assessment Year)** | The year in which income earned during the previous Financial Year is assessed/taxed. AY 2027-28 assesses income earned in FY 2026-27. |
| **Basic salary / Basic + DA** | The core, fixed component of a salary structure (as opposed to allowances like HRA). Many statutory calculations (PF, gratuity) are based on Basic (+ Dearness Allowance for some), not full CTC. |
| **CBDT** | Central Board of Direct Taxes — the government body that administers direct tax law (income tax) in India, and publishes official notifications like the Cost Inflation Index. |
| **Cess** | An additional tax on top of the base tax amount, earmarked for a specific purpose (currently a 4% "Health and Education Cess" applies on top of computed income tax). |
| **CII (Cost Inflation Index)** | A yearly index published by CBDT used to adjust a property's purchase cost for inflation when calculating capital gains ("indexation"). |
| **CTC (Cost to Company)** | The total annual cost an employer incurs for an employee — includes take-home salary plus employer contributions (PF, gratuity accrual, insurance, etc.) that never appear in the employee's bank account. |
| **DPIIT** | Department for Promotion of Industry and Internal Trade — the government body that grants "recognized startup" status, which unlocks certain tax benefits (e.g., ESOP TDS deferral). |
| **ESOP (Employee Stock Option Plan)** | A benefit letting employees purchase company shares at a fixed ("exercise") price, typically below market value, taxed in two stages (see `08-calculators-reference.md`). |
| **FMV (Fair Market Value)** | The estimated open-market value of an asset (e.g., a share) at a specific point in time — relevant for ESOP/RSU taxation and property indexation. |
| **FY (Financial Year)** | India's tax year, running 1 April to 31 March. FY 2026-27 runs April 2026 to March 2027. |
| **Grandfathering** | A legal principle where a rule change doesn't apply retroactively to things that existed before the change — e.g., property bought before 23 July 2024 keeps a choice of tax treatment that newer purchases don't get. |
| **Gratuity** | A lump-sum benefit paid by an employer to an employee for long-term service, under the Payment of Gratuity Act, 1972. |
| **HRA (House Rent Allowance)** | A salary component intended to cover rent, partially tax-exempt under specific conditions (old regime only). |
| **ITR (Income Tax Return)** | The annual tax filing document. Different ITR forms (ITR-1 through ITR-7) apply depending on income type/complexity — e.g., ITR-2 for salary + capital gains without business income, ITR-3 if business/professional income is also present. |
| **LTCG / STCG (Long-Term / Short-Term Capital Gains)** | Profit from selling a capital asset (shares, property, etc.), taxed differently depending on how long the asset was held before sale — the exact holding-period threshold and tax rate vary by asset type. |
| **New tax regime / Old tax regime** | Two parallel income tax systems a taxpayer can choose between each year. The new regime (default since FY 2023-24) has lower rates but almost no deductions; the old regime has higher rates but allows deductions like 80C, 80D, HRA. |
| **Old regime "125" style deduction language** | Not a formal term — just a note that many old-regime deductions are expressed as "least of" multiple conditions (see HRA, gratuity exemption) — a recurring pattern worth recognizing across calculators. |
| **Perquisite** | A non-cash benefit provided by an employer (e.g., the discount an employee gets when exercising ESOPs below market value), taxed as part of salary income. |
| **Presumptive taxation (44AD / 44ADA)** | A simplified tax scheme letting eligible small businesses/professionals declare a fixed percentage of gross receipts as taxable income, without maintaining detailed books or facing audit (within eligibility limits). |
| **PF / EPF (Provident Fund)** | A mandatory retirement savings scheme; both employee and employer contribute a percentage of Basic salary. |
| **RSU (Restricted Stock Unit)** | Similar to an ESOP but with no exercise price — shares vest to the employee outright, typically used by foreign (often US) companies for Indian employees. |
| **Schedule FA (Foreign Assets)** | A section of the Indian ITR requiring disclosure of foreign assets/income, on a calendar-year basis (Jan-Dec) rather than the usual financial year — a common compliance trap for RSU holders. |
| **Section (in "Section 80C", "Section 10(13A)", etc.)** | Refers to a specific numbered section of the Income Tax Act, 1961 — the legal citation for a given rule. |
| **Slab rate** | Progressive tax rates that increase as income rises through defined income bands ("slabs") — as opposed to a flat rate applied uniformly. |
| **STT (Securities Transaction Tax)** | A tax on transactions on recognized Indian stock exchanges — its presence/absence is part of what determines whether shares are treated as "listed" for certain tax rules (relevant to why foreign/RSU shares are always treated as unlisted). |
| **TDS (Tax Deducted at Source)** | Tax an employer (or other payer) withholds and remits to the government on your behalf throughout the year, rather than you paying it all at filing time. |
| **TTBR (SBI TT Buying Rate)** | A specific published foreign exchange rate used for converting foreign-currency income (like RSU vesting value) into INR for Indian tax purposes, per Income Tax Rule 115/206. |

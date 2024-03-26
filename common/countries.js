/* eslint-disable */
/* eslint-env es6 */
// https://raw.githubusercontent.com/lukes/ISO-3166-Countries-with-Regional-Codes/master/slim-3/slim-3.json

const countries = {
  AFG: { name: "Afghanistan" },
  ALA: { name: "Åland Islands" },
  ALB: { name: "Albania" },
  DZA: { name: "Algeria" },
  ASM: { name: "American Samoa" },
  AND: { name: "Andorra" },
  AGO: { name: "Angola" },
  AIA: { name: "Anguilla" },
  ATA: { name: "Antarctica" },
  ATG: { name: "Antigua and Barbuda" },
  ARG: { name: "Argentina" },
  ARM: { name: "Armenia" },
  ABW: { name: "Aruba" },
  AUS: { name: "Australia" },
  AUT: { name: "Austria" },
  AZE: { name: "Azerbaijan" },
  BHS: { name: "Bahamas" },
  BHR: { name: "Bahrain" },
  BGD: { name: "Bangladesh" },
  BRB: { name: "Barbados" },
  BLR: { name: "Belarus" },
  BEL: { name: "Belgium" },
  BLZ: { name: "Belize" },
  BEN: { name: "Benin" },
  BMU: { name: "Bermuda" },
  BTN: { name: "Bhutan" },
  BOL: { name: "Bolivia (Plurinational State of)" },
  BES: { name: "Bonaire, Sint Eustatius and Saba" },
  BIH: { name: "Bosnia and Herzegovina" },
  BWA: { name: "Botswana" },
  BVT: { name: "Bouvet Island" },
  BRA: { name: "Brazil" },
  IOT: { name: "British Indian Ocean Territory" },
  BRN: { name: "Brunei Darussalam" },
  BGR: { name: "Bulgaria" },
  BFA: { name: "Burkina Faso" },
  BDI: { name: "Burundi" },
  CPV: { name: "Cabo Verde" },
  KHM: { name: "Cambodia" },
  CMR: { name: "Cameroon" },
  CAN: { name: "Canada" },
  CYM: { name: "Cayman Islands" },
  CAF: { name: "Central African Republic" },
  TCD: { name: "Chad" },
  CHL: { name: "Chile" },
  CHN: { name: "China" },
  CXR: { name: "Christmas Island" },
  CCK: { name: "Cocos (Keeling) Islands" },
  COL: { name: "Colombia" },
  COM: { name: "Comoros" },
  COG: { name: "Congo" },
  COD: { name: "Congo, Democratic Republic of the" },
  COK: { name: "Cook Islands" },
  CRI: { name: "Costa Rica" },
  CIV: { name: "Côte d'Ivoire" },
  HRV: { name: "Croatia" },
  CUB: { name: "Cuba" },
  CUW: { name: "Curaçao" },
  CYP: { name: "Cyprus" },
  CZE: { name: "Czechia" },
  DNK: { name: "Denmark" },
  DJI: { name: "Djibouti" },
  DMA: { name: "Dominica" },
  DOM: { name: "Dominican Republic" },
  ECU: { name: "Ecuador" },
  EGY: { name: "Egypt" },
  SLV: { name: "El Salvador" },
  GNQ: { name: "Equatorial Guinea" },
  ERI: { name: "Eritrea" },
  EST: { name: "Estonia" },
  SWZ: { name: "Eswatini" },
  ETH: { name: "Ethiopia" },
  FLK: { name: "Falkland Islands (Malvinas)" },
  FRO: { name: "Faroe Islands" },
  FJI: { name: "Fiji" },
  FIN: { name: "Finland" },
  FRA: { name: "France" },
  GUF: { name: "French Guiana" },
  PYF: { name: "French Polynesia" },
  ATF: { name: "French Southern Territories" },
  GAB: { name: "Gabon" },
  GMB: { name: "Gambia" },
  GEO: { name: "Georgia" },
  DEU: { name: "Germany" },
  GHA: { name: "Ghana" },
  GIB: { name: "Gibraltar" },
  GRC: { name: "Greece" },
  GRL: { name: "Greenland" },
  GRD: { name: "Grenada" },
  GLP: { name: "Guadeloupe" },
  GUM: { name: "Guam" },
  GTM: { name: "Guatemala" },
  GGY: { name: "Guernsey" },
  GIN: { name: "Guinea" },
  GNB: { name: "Guinea-Bissau" },
  GUY: { name: "Guyana" },
  HTI: { name: "Haiti" },
  HMD: { name: "Heard Island and McDonald Islands" },
  VAT: { name: "Holy See" },
  HND: { name: "Honduras" },
  HKG: { name: "Hong Kong" },
  HUN: { name: "Hungary" },
  ISL: { name: "Iceland" },
  IND: { name: "India" },
  IDN: { name: "Indonesia" },
  IRN: { name: "Iran (Islamic Republic of)" },
  IRQ: { name: "Iraq" },
  IRL: { name: "Ireland" },
  IMN: { name: "Isle of Man" },
  ISR: { name: "Israel" },
  ITA: { name: "Italy" },
  JAM: { name: "Jamaica" },
  JPN: { name: "Japan" },
  JEY: { name: "Jersey" },
  JOR: { name: "Jordan" },
  KAZ: { name: "Kazakhstan" },
  KEN: { name: "Kenya" },
  KIR: { name: "Kiribati" },
  PRK: { name: "Korea (Democratic People's Republic of)" },
  KOR: { name: "Korea, Republic of" },
  KWT: { name: "Kuwait" },
  KGZ: { name: "Kyrgyzstan" },
  LAO: { name: "Lao People's Democratic Republic" },
  LVA: { name: "Latvia" },
  LBN: { name: "Lebanon" },
  LSO: { name: "Lesotho" },
  LBR: { name: "Liberia" },
  LBY: { name: "Libya" },
  LIE: { name: "Liechtenstein" },
  LTU: { name: "Lithuania" },
  LUX: { name: "Luxembourg" },
  MAC: { name: "Macao" },
  MDG: { name: "Madagascar" },
  MWI: { name: "Malawi" },
  MYS: { name: "Malaysia" },
  MDV: { name: "Maldives" },
  MLI: { name: "Mali" },
  MLT: { name: "Malta" },
  MHL: { name: "Marshall Islands" },
  MTQ: { name: "Martinique" },
  MRT: { name: "Mauritania" },
  MUS: { name: "Mauritius" },
  MYT: { name: "Mayotte" },
  MEX: { name: "Mexico" },
  FSM: { name: "Micronesia (Federated States of)" },
  MDA: { name: "Moldova, Republic of" },
  MCO: { name: "Monaco" },
  MNG: { name: "Mongolia" },
  MNE: { name: "Montenegro" },
  MSR: { name: "Montserrat" },
  MAR: { name: "Morocco" },
  MOZ: { name: "Mozambique" },
  MMR: { name: "Myanmar" },
  NAM: { name: "Namibia" },
  NRU: { name: "Nauru" },
  NPL: { name: "Nepal" },
  NLD: { name: "Netherlands" },
  NCL: { name: "New Caledonia" },
  NZL: { name: "New Zealand" },
  NIC: { name: "Nicaragua" },
  NER: { name: "Niger" },
  NGA: { name: "Nigeria" },
  NIU: { name: "Niue" },
  NFK: { name: "Norfolk Island" },
  MKD: { name: "North Macedonia" },
  MNP: { name: "Northern Mariana Islands" },
  NOR: { name: "Norway" },
  OMN: { name: "Oman" },
  PAK: { name: "Pakistan" },
  PLW: { name: "Palau" },
  PSE: { name: "Palestine, State of" },
  PAN: { name: "Panama" },
  PNG: { name: "Papua New Guinea" },
  PRY: { name: "Paraguay" },
  PER: { name: "Peru" },
  PHL: { name: "Philippines" },
  PCN: { name: "Pitcairn" },
  POL: { name: "Poland" },
  PRT: { name: "Portugal" },
  PRI: { name: "Puerto Rico" },
  QAT: { name: "Qatar" },
  REU: { name: "Réunion" },
  ROU: { name: "Romania" },
  RUS: { name: "Russian Federation" },
  RWA: { name: "Rwanda" },
  BLM: { name: "Saint Barthélemy" },
  SHN: { name: "Saint Helena, Ascension and Tristan da Cunha" },
  KNA: { name: "Saint Kitts and Nevis" },
  LCA: { name: "Saint Lucia" },
  MAF: { name: "Saint Martin (French part)" },
  SPM: { name: "Saint Pierre and Miquelon" },
  VCT: { name: "Saint Vincent and the Grenadines" },
  WSM: { name: "Samoa" },
  SMR: { name: "San Marino" },
  STP: { name: "Sao Tome and Principe" },
  SAU: { name: "Saudi Arabia" },
  SEN: { name: "Senegal" },
  SRB: { name: "Serbia" },
  SYC: { name: "Seychelles" },
  SLE: { name: "Sierra Leone" },
  SGP: { name: "Singapore" },
  SXM: { name: "Sint Maarten (Dutch part)" },
  SVK: { name: "Slovakia" },
  SVN: { name: "Slovenia" },
  SLB: { name: "Solomon Islands" },
  SOM: { name: "Somalia" },
  ZAF: { name: "South Africa" },
  SGS: { name: "South Georgia and the South Sandwich Islands" },
  SSD: { name: "South Sudan" },
  ESP: { name: "Spain" },
  LKA: { name: "Sri Lanka" },
  SDN: { name: "Sudan" },
  SUR: { name: "Suriname" },
  SJM: { name: "Svalbard and Jan Mayen" },
  SWE: { name: "Sweden" },
  CHE: { name: "Switzerland" },
  SYR: { name: "Syrian Arab Republic" },
  TWN: { name: "Taiwan, Province of China" },
  TJK: { name: "Tajikistan" },
  TZA: { name: "Tanzania, United Republic of" },
  THA: { name: "Thailand" },
  TLS: { name: "Timor-Leste" },
  TGO: { name: "Togo" },
  TKL: { name: "Tokelau" },
  TON: { name: "Tonga" },
  TTO: { name: "Trinidad and Tobago" },
  TUN: { name: "Tunisia" },
  TUR: { name: "Turkey" },
  TKM: { name: "Turkmenistan" },
  TCA: { name: "Turks and Caicos Islands" },
  TUV: { name: "Tuvalu" },
  UGA: { name: "Uganda" },
  UKR: { name: "Ukraine" },
  ARE: { name: "United Arab Emirates" },
  GBR: { name: "United Kingdom of Great Britain and Northern Ireland" },
  USA: { name: "United States of America" },
  UMI: { name: "United States Minor Outlying Islands" },
  URY: { name: "Uruguay" },
  UZB: { name: "Uzbekistan" },
  VUT: { name: "Vanuatu" },
  VEN: { name: "Venezuela (Bolivarian Republic of)" },
  VNM: { name: "Viet Nam" },
  VGB: { name: "Virgin Islands (British)" },
  VIR: { name: "Virgin Islands (U.S.)" },
  WLF: { name: "Wallis and Futuna" },
  ESH: { name: "Western Sahara" },
  YEM: { name: "Yemen" },
  ZMB: { name: "Zambia" },
  ZWE: { name: "Zimbabwe" },
};

export default countries;

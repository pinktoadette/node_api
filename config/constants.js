const { Hashtags } = require("../db/models");
const { Articles } = require("../db/models/articles.model");
const { Comments } = require("../db/models/comments.model");

const twilioAccountSid = '';
const twilioAuthToken = '';

const pickMe = [
  'og:article:published_time',
  'og:article:author',
  'og:article:section',
  'og:article:tag',
  'og:locale',
  'og:title',
  'og:type',
  'og:description',
  'og:determiner',
  'og:site_name',
  'og:image',
  'og:image:secure_url',
  'og:image:type',
  'og:image:width',
  'og:image:height',
  'source',]

const forbiddenHash = [
"alone",	"always",	"armparty",	"adulting",	"assday",	"ass",	"abdl",	"assworship",	"addmysc",	"asiangirl",																							
"beautyblogger",	"brain",	"boho",	"besties",	"bikinibody",																												
"costumes",	"curvygirls",																															
"date",	"dating",	"desk",	"dm",	"direct",																												
"elevator",	"eggplant",	"edm",																														
"fuck",																																
"girlsonly",	"gloves",	"graffitiigers",																														
"happythanksgiving",	"hawks",	"hotweather",	"humpday",	"hustler",																												
"ilovemyinstagram",	"instababy",	"instasport",	"iphonegraphy",	"italiano",	"ice",																											
"killingit",	"kansas",	"kissing",	"kickoff",																													
"leaves",	"like",	"lulu",	"lean",																													
"master",	"milf",	"mileycyrus",	"models",	"mustfollow",																												
"nasty",	"newyearsday",	"nude",	"nudism",	"nudity",																												
"overnight",	"orderweedonline",																															
"parties",	"petite",	"pornfood",	"pushups",	"prettygirl",	"porn",																											
"rate",	"ravens",																															
"samelove",	"selfharm",	"skateboarding",	"skype",	"snap",	"snapchat",	"single",	"singlelife",	"stranger",	"saltwater",	"shower",	"shit",	"sopretty",	"sunbathing",	"streetphoto",	"swole",	"snowstorm",	"sun",	"sexy",														
"tanlines",	"todayimwearing",	"teens",	"teen",	"thought",	"tag4like",	"tagsforlikes",	"thighs",																									
"undies",																																
"valentinesday",																																
"wtf",																																
"workflow",																																
"xanax",																																
"youngmodel",																																
"adultlife",	"americangirl",	"asia",	"abc7ny",	"attractive",	"abcess",	"africanexpeditions",	"agariogaming",	"akiralane",	"allbreasts",	"amearalavey",	"animenoobs",	"afourchamberedheart",	"audaciousprayer",	"beautydirectory",	"babe",	"bbc",	"easter",	"fitnessgirls",	"fishnets",	"hardworkpaysoff",	"ig",	"loseweight",	"lingerie",	"mirrorphoto",	"newyears",	"qatar",	"sallyhansen",	"stud",	"tgif",	"treasurethesemoments",		
"breasts",																																
"vagina",																																
"pussy",																																
"cock",																																
"dick",																																
"ass",																																
]

const modelMap = {
  'article': Articles,
  'hashtags': Hashtags , 
  'comments': Comments,
   'real' : Articles
}

module.exports = {
    twilioAccountSid,
    twilioAuthToken,
    pickMe,
    forbiddenHash,
    modelMap
  }

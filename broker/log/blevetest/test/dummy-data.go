package main

import (
	"bytes"
	"fmt"
	"math/rand"
	"regexp"
	"strings"
	"time"
)

var (
	// an array of words (from "la declaration universelle des droits de l'homme") to generate random messages
	frWords []string
	enWords []string
)

func init() {
	// Get rid of new line characters
	re := regexp.MustCompile(`\r?\n`)
	declaText = re.ReplaceAllString(declaText, " ")
	// Turns text into an array of random words
	frWords = strings.Split(string(declaText), " ")

	declaTextEn = re.ReplaceAllString(declaTextEn, " ")
	enWords = strings.Split(string(declaTextEn), " ")
}

// VARIOUS HELPERS

// generateDummyData generates an array of dummy JSON log message to test indexing.
func generateDummyData(lang string, loopNb int, useSmallSample bool) ([]string, error) {
	fmt.Printf("Generating dummy data\n")

	sampleSize := len(sampleTs)
	if useSmallSample { // smaller corpus
		sampleSize = 10
	}
	offset := 0

	lines := make([]string, sampleSize*(loopNb))
	for i := 0; i < sampleSize; i++ {
		lines[i] = createJsonLog(
			sampleLogger[i%len(sampleLogger)],
			sampleLevel[i%len(sampleLevel)],
			sampleMsgId[i%len(sampleMsgId)],
			getRandomMsg(lang, i),
			sampleUserName[i%len(sampleUserName)],
			sampleTs[i])
	}

	fmt.Printf("First pass, %d events created\n", sampleSize)
	fmt.Printf("Checking one random line:\n %s\n", lines[rand.Intn(sampleSize)])

	for j := 0; j < loopNb-1; j++ {
		rand.Seed(int64(42 + j*3))

		offset += sampleSize

		for i := 0; i < sampleSize; i++ {
			r := rand.Intn(500)
			k := r + i
			lines[i+offset] = createJsonLog(
				sampleLogger[k%3],
				sampleLevel[k%2],
				sampleMsgId[k%4],
				getRandomMsg(lang, i),
				sampleUserName[k%5],
				sampleTs[i]+int32(k*3600))
		}
		fmt.Printf("Add %d events, current sample size: %d \n", sampleSize, sampleSize*(2+j))
		index := offset + rand.Intn(sampleSize-j-1)
		fmt.Printf("Checking one random line at index: %d\n %s\n", index, lines[index])
	}

	return lines, nil
}

func getRandomMsg(lang string, i int) string {

	words := enWords
	if lang == "fr" {
		words = frWords
	}

	rand.Seed(int64(109 + i*17))
	wordNb := rand.Intn(64) + 16
	l := len(words)

	var buffer bytes.Buffer
	for j := 0; j < wordNb; j++ {
		ind := (rand.Intn(l)) % l // + j*2 + wordNb
		buffer.WriteString(words[ind])
		buffer.WriteString(" ")
	}

	return buffer.String()
}

func createJsonLog(lo, le, mid, msg, u string, ts int32) string {
	str := fmt.Sprintf(`{"logger": "%s", "level": "%s", "msg":"%s", "MsgId": "%s", "UserName":"%s", "ts":"%s",  "RemoteAddress":"127.0.0.1"}`,
		lo, le, msg, mid, u,
		convertTsToTime(ts).Format(time.RFC3339))
	return str
}

func convertTsToTime(ts int32) time.Time {
	return time.Unix(int64(ts), 0)
}

var (
	sampleLevel    = [3]string{"info", "warning", "error"}
	sampleMsgId    = [4]string{"200", "201", "404", "500"}
	sampleUserName = [8]string{"admin", "john", "leia", "anakin", "birgit", "elsa", "gertrude", "monique"}
	sampleLogger   = [3]string{"grpc.service.one", "rest.service.one", "rest.service.two"}

	// Random but fixed timestamps
	sampleTs = [1000]int32{
		1519905416, 1519905194, 1519904972, 1519904750, 1519904528, 1519904306, 1519904084, 1519903862, 1519903640, 1519903418, 1519903196, 1519902974, 1519902752, 1519902530, 1519902308, 1519902086, 1519901864, 1519901642, 1519901420, 1519901198, 1519900976, 1519900754, 1519690614, 1519688392, 1519686170,
		1519683948, 1519681726, 1519679504, 1519677282, 1519675060, 1468272518, 1477237409, 1479980063, 1487611883, 1456428179, 1514572024, 1449529559, 1479749545, 1458835172, 1493610026, 1467913666, 1454075512, 1483481233, 1502126533, 1494314948, 1499810354, 1480522346, 1481277625, 1502115113, 1492659473,
		1454769203, 1468438646, 1493013689, 1484777028, 1478556676, 1516980699, 1487354949, 1464070843, 1513933351, 1475887346, 1474684030, 1508478236, 1506789508, 1493733173, 1512588763, 1513227960, 1469433130, 1499707495, 1510524008, 1474804268, 1499645350, 1508782242, 1490131972, 1458069911, 1518221242,
		1507805349, 1515562009, 1489830949, 1510023696, 1471006187, 1463545223, 1480456644, 1462315550, 1467214215, 1510167390, 1516659548, 1495486332, 1478560558, 1471751805, 1504515599, 1497857605, 1497813395, 1519557845, 1464849021, 1464919487, 1509494140, 1490378014, 1513390137, 1511933688, 1507242532,
		1470524121, 1489247730, 1476006558, 1452910055, 1486314037, 1474389348, 1508953001, 1508688973, 1471395640, 1503834332, 1454557550, 1515811432, 1461520309, 1494569766, 1497967707, 1472595216, 1503989684, 1512094086, 1484523360, 1509579357, 1503453487, 1453805746, 1457363511, 1500629424, 1450029047,
		1518201597, 1497111672, 1488538948, 1481131527, 1518609652, 1479284768, 1491125781, 1501947624, 1449025769, 1487235300, 1509127297, 1478296910, 1487846444, 1496441718, 1448740806, 1507643284, 1483208426, 1457192373, 1485810114, 1472002653, 1495999426, 1481828508, 1501854557, 1469807313, 1508465074,
		1498999656, 1486504792, 1475602119, 1512843108, 1504546308, 1477152249, 1513113057, 1478027131, 1457268552, 1496427494, 1506885902, 1464883768, 1454390462, 1482782499, 1481752208, 1452449220, 1462535691, 1462803490, 1475068532, 1466226350, 1486360547, 1448434853, 1498797898, 1469646925, 1486976050,
		1467415091, 1450654256, 1498861096, 1458182002, 1515819276, 1483052454, 1496511393, 1490561214, 1513114289, 1517745858, 1473272330, 1509258072, 1498866288, 1452882214, 1507843458, 1502831242, 1481558007, 1477264027, 1461017691, 1470357558, 1498963928, 1504313342, 1476547480, 1518224212, 1486682013,
		1511420224, 1519597807, 1506434910, 1459571036, 1473640959, 1506360107, 1498412164, 1510843028, 1457796434, 1474559105, 1506956071, 1450523435, 1449048693, 1512184103, 1461390361, 1500746784, 1498531623, 1499060124, 1504036276, 1494083454, 1474481325, 1461470095, 1515660349, 1461610724, 1500291217,
		1514205315, 1470176700, 1482463335, 1456271997, 1453422364, 1468554137, 1451769280, 1519836223, 1501965035, 1469131338, 1465404376, 1516460085, 1458823304, 1466698886, 1470180628, 1464927057, 1513020100, 1482037008, 1493549887, 1518672382, 1493701325, 1519215486, 1466930055, 1449385527, 1475527259,
		1494947276, 1482925834, 1494997905, 1455353527, 1468693129, 1461118780, 1511770629, 1465175177, 1483680221, 1498120141, 1485269069, 1506347269, 1509413142, 1462116216, 1499742826, 1488569222, 1501200300, 1486650936, 1504334869, 1491735877, 1475866607, 1452034466, 1485740039, 1503167833, 1464310519,
		1455105663, 1448862315, 1498980929, 1513585905, 1466259264, 1454798104, 1484960983, 1497342126, 1478626723, 1489714125, 1505086091, 1467552360, 1470250316, 1507099994, 1448947305, 1495160046, 1488991146, 1505066160, 1507939264, 1482550148, 1456210183, 1466635427, 1471530844, 1488703661, 1504462462,
		1465194131, 1476919309, 1489007745, 1491313511, 1477704419, 1450595736, 1500744547, 1451785250, 1482635620, 1463011698, 1501889787, 1486498559, 1452322997, 1513630476, 1461941793, 1462392395, 1506563331, 1490712606, 1516644973, 1508676705, 1519459037, 1515979758, 1479970201, 1490988840, 1472963313,
		1449455671, 1465153899, 1507415113, 1509448084, 1462602225, 1506525763, 1479279025, 1453881931, 1507934723, 1516789650, 1485454088, 1458584873, 1498712400, 1461043605, 1493655975, 1513185998, 1480345413, 1472604977, 1466995089, 1519413094, 1511257017, 1476604657, 1459916640, 1513169028, 1476159762,
		1468979127, 1448539127, 1494376222, 1492814985, 1501802332, 1490825987, 1510782609, 1461482616, 1454015629, 1488276786, 1483452541, 1454412730, 1508607398, 1459209587, 1494102012, 1477193152, 1473477419, 1472774149, 1469180933, 1457544309, 1453715255, 1504030924, 1519941996, 1493583908, 1455971882,
		1488907811, 1503786777, 1458880416, 1510408453, 1513864343, 1509929278, 1500141243, 1514624341, 1461161304, 1508142880, 1481374679, 1475713237, 1503583818, 1504377836, 1474848588, 1505369635, 1500737320, 1474041564, 1453390161, 1492798933, 1450004057, 1476670623, 1470269691, 1449646285, 1458643786,
		1509169668, 1495612940, 1486445591, 1483118572, 1465595545, 1498605342, 1509428112, 1507009572, 1449923702, 1450321926, 1519036847, 1491515311, 1496412242, 1448845995, 1450528073, 1506521963, 1480889243, 1493600645, 1488859557, 1507684622, 1491106734, 1512615186, 1484804381, 1489541968, 1502601481,
		1468843580, 1508953797, 1510050148, 1455145706, 1458274480, 1491956404, 1507674542, 1514714551, 1510716099, 1501367538, 1462942466, 1518085066, 1494927007, 1463793044, 1511418252, 1498955802, 1476831601, 1473164242, 1448736227, 1492649996, 1459060949, 1472557964, 1500382928, 1491821282, 1497235426,
		1456467988, 1448641477, 1489938995, 1495735331, 1480531402, 1491686968, 1510895030, 1516058274, 1495190202, 1515597887, 1455437013, 1452002714, 1492385010, 1496500076, 1460664120, 1456910267, 1492132514, 1459334122, 1452093040, 1470325444, 1486994107, 1516854819, 1493747564, 1462956533, 1461190878,
		1464115596, 1463547249, 1517381766, 1502693885, 1478992363, 1505792738, 1465910147, 1502898122, 1469080147, 1491378100, 1460121420, 1512365603, 1515500830, 1455129996, 1451408521, 1481761813, 1469019751, 1485123650, 1491352446, 1486897117, 1515561599, 1494579732, 1519539414, 1478038699, 1486785249,
		1459211926, 1478790869, 1451860507, 1506788126, 1507606917, 1486428756, 1494923947, 1512927162, 1469505346, 1506787461, 1463986877, 1499963347, 1451960077, 1489802585, 1462586889, 1486169062, 1472274954, 1489402910, 1470114562, 1460607361, 1513020837, 1499087433, 1507379128, 1484364037, 1481150986,
		1493942668, 1457697832, 1471638425, 1480343643, 1475684166, 1460867700, 1474321502, 1506180428, 1500489535, 1483975035, 1486856897, 1455821124, 1464094639, 1518990005, 1469681455, 1481731393, 1479744261, 1483634640, 1489694030, 1518834216, 1506208805, 1459305023, 1451444564, 1468724399, 1451708864,
		1478544834, 1476331130, 1511227572, 1497225416, 1479089223, 1506912037, 1493010508, 1486914461, 1492292038, 1464163566, 1467387001, 1458403338, 1455922947, 1518105849, 1461005740, 1451558408, 1458566299, 1449329304, 1473377372, 1493373011, 1480672447, 1497842261, 1510304952, 1518500256, 1486698782,
		1498923581, 1451015085, 1477067046, 1493921864, 1476710848, 1505873291, 1469627924, 1508402525, 1501288852, 1478575546, 1498790865, 1452906301, 1480648634, 1455455040, 1455454626, 1489516491, 1448827189, 1468646356, 1459882243, 1465804990, 1495343571, 1470001312, 1498363806, 1477035812, 1452021156,
		1448766118, 1487161011, 1485019299, 1486730336, 1508998126, 1456382355, 1468431978, 1500588180, 1451007226, 1484855039, 1459726188, 1478002826, 1516786914, 1493566898, 1518250643, 1490101835, 1490893759, 1479759772, 1508449247, 1456811271, 1503621479, 1504717587, 1507727413, 1507884446, 1456304839,
		1455661601, 1485853493, 1466914026, 1503035288, 1498227151, 1478353588, 1449214143, 1464319227, 1489393912, 1468182083, 1487837032, 1455349891, 1508977668, 1517896287, 1465280889, 1479552539, 1478052170, 1492880326, 1517428006, 1480250590, 1482065079, 1513785844, 1451648104, 1481276557, 1501930281,
		1510879840, 1486849202, 1498378099, 1483316405, 1485276756, 1454299798, 1503503199, 1516365373, 1493807710, 1492555974, 1470561288, 1510625459, 1485708077, 1478372851, 1499767535, 1465112276, 1494779720, 1518931668, 1466458416, 1479099131, 1495639061, 1453586399, 1481203736, 1475686882, 1490705223,
		1467083674, 1504859759, 1463666034, 1452700563, 1517358009, 1453017721, 1455953736, 1463971192, 1480922912, 1464373709, 1490855324, 1500781911, 1474269548, 1499649973, 1481651871, 1498665496, 1488127894, 1480928027, 1470641698, 1513260536, 1479945081, 1518575816, 1451865068, 1504245879, 1515028005,
		1460554840, 1460648693, 1483230007, 1493821448, 1480915643, 1518140234, 1452418988, 1470235508, 1509305215, 1452887765, 1489551214, 1474979870, 1505211485, 1510082737, 1490285601, 1514018727, 1458598771, 1517701675, 1463461918, 1509471384, 1449048927, 1490832011, 1474396485, 1470447818, 1518906125,
		1489460172, 1516967923, 1501292956, 1456511834, 1507490172, 1491723408, 1518697331, 1514353300, 1452592925, 1504014732, 1486847625, 1470450901, 1466265837, 1451892343, 1451207439, 1473461076, 1516112878, 1506821319, 1485764347, 1468733137, 1470024825, 1479752760, 1485638300, 1506651969, 1499277668,
		1519157642, 1510150344, 1466192200, 1476316904, 1470671618, 1499856229, 1511184521, 1453157397, 1497070344, 1473872768, 1514715119, 1456020317, 1499415525, 1455915891, 1510282555, 1494234943, 1505773620, 1495652933, 1510300486, 1486208917, 1493060815, 1475077440, 1517724405, 1497084073, 1478795096,
		1465305031, 1455619133, 1460175085, 1448511062, 1471717898, 1510368232, 1454311897, 1465161146, 1462340507, 1515454232, 1496121208, 1501201859, 1481740317, 1489242472, 1501063188, 1471995879, 1464977798, 1482365217, 1501048453, 1512190655, 1513225444, 1494902228, 1474809278, 1492834075, 1518568909,
		1459544552, 1477364180, 1497532377, 1480510576, 1455296728, 1473527278, 1453778137, 1478319453, 1465892242, 1506434951, 1479738754, 1475138559, 1476828023, 1501818373, 1456746238, 1516298909, 1497413705, 1479636172, 1510995892, 1481447598, 1516339960, 1480750773, 1505394172, 1505966501, 1505928895,
		1518211711, 1457732188, 1504017724, 1485487510, 1470683895, 1461184863, 1454001277, 1452613445, 1475074970, 1456874432, 1501413320, 1489305049, 1477487089, 1477346187, 1502098438, 1474561476, 1505766876, 1486782607, 1464936294, 1489616482, 1497784262, 1518032623, 1484613025, 1452258329, 1472470327,
		1515454623, 1465133216, 1474850649, 1456828909, 1506563013, 1507119754, 1489669696, 1496735379, 1513419615, 1501791974, 1508206625, 1476882900, 1456261800, 1488905798, 1470199943, 1477729021, 1458719586, 1465934667, 1489600894, 1511632969, 1448422740, 1459178017, 1471470094, 1494238920, 1499992242,
		1522234951, 1479738754, 1495138559, 1496828023, 1511818373, 1496746238, 1496298909, 1507413505, 1509630172, 1510944492, 1481447898, 1516338960, 1480789773, 1505784172, 1505966786, 1505928675, 1518211790, 1457732872, 1504017874, 1494710591, 1492758781, 1513628204, 1514171976, 1512558757, 1495380103,
		1492371568, 1501242205, 1514738928, 1449045840, 1470753798, 1476541865, 1457411033, 1451849378, 1497398875, 1462918007, 1513788557, 1482651423, 1506621778, 1506640112, 1502028067, 1489821476, 1476945427, 1505792249, 1509023325, 1467591312, 1485620641, 1511103953, 1485496550, 1470928813, 1507340915,
		1485623100, 1476978403, 1450860727, 1483110204, 1495622110, 1502468271, 1504108274, 1448433460, 1517350491, 1455750278, 1514749363, 1504344236, 1510291140, 1467281965, 1478579307, 1474652599, 1476657334, 1502330755, 1480624731, 1515777458, 1452066001, 1514957917, 1514080556, 1474079627, 1513611815,
		1459840286, 1454410989, 1503902941, 1510291562, 1457685370, 1496816166, 1502962261, 1495028998, 1479426533, 1495211134, 1452733911, 1518469280, 1512406980, 1452234362, 1481526341, 1517091313, 1495998819, 1450908360, 1471257977, 1497169327, 1456197675, 1489492404, 1487503112, 1489760396, 1517601824,
		1450216016, 1502004774, 1486517335, 1465090937, 1471361105, 1508360191, 1496859209, 1497408118, 1469026979, 1502596883, 1471786614, 1502666903, 1453015919, 1474769101, 1519925862, 1509335959, 1488991746, 1484363046, 1458393486, 1465573722, 1489461183, 1472206570, 1519568035, 1465967407, 1476446475}

	declaText = `
Préambule
Considérant que la reconnaissance de la dignité inhérente à tous les membres de la famille humaine et de leurs droits égaux et inaliénables constitue le fondement de la liberté, de la justice et de la paix dans le monde.
Considérant que la méconnaissance et le mépris des droits de l'homme ont conduit à des actes de barbarie qui révoltent la conscience de l'humanité et que l'avènement d'un monde où les êtres humains seront libres de parler et de croire, libérés de la terreur et de la misère, a été proclamé comme la plus haute aspiration de l'homme.
Considérant qu'il est essentiel que les droits de l'homme soient protégés par un régime de droit pour que l'homme ne soit pas contraint, en suprême recours, à la révolte contre la tyrannie et l'oppression.
Considérant qu'il est essentiel d'encourager le développement de relations amicales entre nations.
Considérant que dans la Charte les peuples des Nations Unies ont proclamé à nouveau leur foi dans les droits fondamentaux de l'homme, dans la dignité et la valeur de la personne humaine, dans l'égalité des droits des hommes et des femmes, et qu'ils se sont déclarés résolus à favoriser le progrès social et à instaurer de meilleures conditions de vie dans une liberté plus grande.
Considérant que les Etats Membres se sont engagés à assurer, en coopération avec l'Organisation des Nations Unies, le respect universel et effectif des droits de l'homme et des libertés fondamentales.
Considérant qu'une conception commune de ces droits et libertés est de la plus haute importance pour remplir pleinement cet engagement.
L'Assemblée générale proclame la présente Déclaration universelle des droits de l'homme comme l'idéal commun à atteindre par tous les peuples et toutes les nations afin que tous les individus et tous les organes de la société, ayant cette Déclaration constamment à l'esprit, s'efforcent, par l'enseignement et l'éducation, de développer le respect de ces droits et libertés et d'en assurer, par des mesures progressives d'ordre national et international, la reconnaissance et l'application universelles et effectives, tant parmi les populations des Etats Membres eux-mêmes que parmi celles des territoires placés sous leur juridiction.
Article premier
Tous les êtres humains naissent libres et égaux en dignité et en droits. Ils sont doués de raison et de conscience et doivent agir les uns envers les autres dans un esprit de fraternité.
Article 2
1. Chacun peut se prévaloir de tous les droits et de toutes les libertés proclamés dans la présente Déclaration, sans distinction aucune, notamment de race, de couleur, de sexe, de langue, de religion, d'opinion politique ou de toute autre opinion, d'origine nationale ou sociale, de fortune, de naissance ou de toute autre situation.
2. De plus, il ne sera fait aucune distinction fondée sur le statut politique, juridique ou international du pays ou du territoire dont une personne est ressortissante, que ce pays ou territoire soit indépendant, sous tutelle, non autonome ou soumis à une limitation quelconque de souveraineté.
Article 3
Tout individu a droit à la vie, à la liberté et à la sûreté de sa personne.
Article 4
Nul ne sera tenu en esclavage ni en servitude; l'esclavage et la traite des esclaves sont interdits sous toutes leurs formes.
Article 5
Nul ne sera soumis à la torture, ni à des peines ou traitements cruels, inhumains ou dégradants.
Article 6
Chacun a le droit à la reconnaissance en tous lieux de sa personnalité juridique.
Article 7
Tous sont égaux devant la loi et ont droit sans distinction à une égale protection de la loi. Tous ont droit à une protection égale contre toute discrimination qui violerait la présente Déclaration et contre toute provocation à une telle discrimination.
Article 8
Toute personne a droit à un recours effectif devant les juridictions nationales compétentes contre les actes violant les droits fondamentaux qui lui sont reconnus par la constitution ou par la loi.
Article 9
Nul ne peut être arbitrairement arrêté, détenu ou exilé.
Article 10
Toute personne a droit, en pleine égalité, à ce que sa cause soit entendue équitablement et publiquement par un tribunal indépendant et impartial, qui décidera, soit de ses droits et obligations, soit du bien-fondé de toute accusation en matière pénale dirigée contre elle.
Article 11
1. Toute personne accusée d'un acte délictueux est présumée innocente jusqu'à ce que sa culpabilité ait été légalement établie au cours d'un procès public où toutes les garanties nécessaires à sa défense lui auront été assurées. 
2. Nul ne sera condamné pour des actions ou omissions qui, au moment où elles ont été commises, ne constituaient pas un acte délictueux d'après le droit national ou international. De même, il ne sera infligé aucune peine plus forte que celle qui était applicable au moment où l'acte délictueux a été commis.
Article 12
Nul ne sera l'objet d'immixtions arbitraires dans sa vie privée, sa famille, son domicile ou sa correspondance, ni d'atteintes à son honneur et à sa réputation. Toute personne a droit à la protection de la loi contre de telles immixtions ou de telles atteintes.
Article 13
1. Toute personne a le droit de circuler librement et de choisir sa résidence à l'intérieur d'un Etat. 
2. Toute personne a le droit de quitter tout pays, y compris le sien, et de revenir dans son pays.
Article 14
1. Devant la persécution, toute personne a le droit de chercher asile et de bénéficier de l'asile en d'autres pays. 
2. Ce droit ne peut être invoqué dans le cas de poursuites réellement fondées sur un crime de droit commun ou sur des agissements contraires aux buts et aux principes des Nations Unies.
Article 15
1. Tout individu a droit à une nationalité. 
2. Nul ne peut être arbitrairement privé de sa nationalité, ni du droit de changer de nationalité.
Article 16
1. A partir de l'âge nubile, l'homme et la femme, sans aucune restriction quant à la race, la nationalité ou la religion, ont le droit de se marier et de fonder une famille. Ils ont des droits égaux au regard du mariage, durant le mariage et lors de sa dissolution. 
2. Le mariage ne peut être conclu qu'avec le libre et plein consentement des futurs époux. 
3. La famille est l'élément naturel et fondamental de la société et a droit à la protection de la société et de l'Etat.
Article 17
1. Toute personne, aussi bien seule qu'en collectivité, a droit à la propriété.
2. Nul ne peut être arbitrairement privé de sa propriété.
Article 18
Toute personne a droit à la liberté de pensée, de conscience et de religion ; ce droit implique la liberté de changer de religion ou de conviction ainsi que la liberté de manifester sa religion ou sa conviction seule ou en commun, tant en public qu'en privé, par l'enseignement, les pratiques, le culte et l'accomplissement des rites.
Article 19
Tout individu a droit à la liberté d'opinion et d'expression, ce qui implique le droit de ne pas être inquiété pour ses opinions et celui de chercher, de recevoir et de répandre, sans considérations de frontières, les informations et les idées par quelque moyen d'expression que ce soit.
Article 20
1. Toute personne a droit à la liberté de réunion et d'association pacifiques. 
2. Nul ne peut être obligé de faire partie d'une association.
Article 21
1. Toute personne a le droit de prendre part à la direction des affaires publiques de son pays, soit directement, soit par l'intermédiaire de représentants librement choisis. 
2. Toute personne a droit à accéder, dans des conditions d'égalité, aux fonctions publiques de son pays.
3. La volonté du peuple est le fondement de l'autorité des pouvoirs publics ; cette volonté doit s'exprimer par des élections honnêtes qui doivent avoir lieu périodiquement, au suffrage universel égal et au vote secret ou suivant une procédure équivalente assurant la liberté du vote.
Article 22
Toute personne, en tant que membre de la société, a droit à la sécurité sociale ; elle est fondée à obtenir la satisfaction des droits économiques, sociaux et culturels indispensables à sa dignité et au libre développement de sa personnalité, grâce à l'effort national et à la coopération internationale, compte tenu de l'organisation et des ressources de chaque pays.
Article 23
1. Toute personne a droit au travail, au libre choix de son travail, à des conditions équitables et satisfaisantes de travail et à la protection contre le chômage. 
2. Tous ont droit, sans aucune discrimination, à un salaire égal pour un travail égal. 
3. Quiconque travaille a droit à une rémunération équitable et satisfaisante lui assurant ainsi qu'à sa famille une existence conforme à la dignité humaine et complétée, s'il y a lieu, par tous autres moyens de protection sociale. 
4. Toute personne a le droit de fonder avec d'autres des syndicats et de s'affilier à des syndicats pour la défense de ses intérêts.
Article 24
Toute personne a droit au repos et aux loisirs et notamment à une limitation raisonnable de la durée du travail et à des congés payés périodiques.
Article 25
1. Toute personne a droit à un niveau de vie suffisant pour assurer sa santé, son bien-être et ceux de sa famille, notamment pour l'alimentation, l'habillement, le logement, les soins médicaux ainsi que pour les services sociaux nécessaires ; elle a droit à la sécurité en cas de chômage, de maladie, d'invalidité, de veuvage, de vieillesse ou dans les autres cas de perte de ses moyens de subsistance par suite de circonstances indépendantes de sa volonté. 
2. La maternité et l'enfance ont droit à une aide et à une assistance spéciales. Tous les enfants, qu'ils soient nés dans le mariage ou hors mariage, jouissent de la même protection sociale.
Article 26
1. Toute personne a droit à l'éducation. L'éducation doit être gratuite, au moins en ce qui concerne l'enseignement élémentaire et fondamental. L'enseignement élémentaire est obligatoire. L'enseignement technique et professionnel doit être généralisé ; l'accès aux études supérieures doit être ouvert en pleine égalité à tous en fonction de leur mérite. 
2. L'éducation doit viser au plein épanouissement de la personnalité humaine et au renforcement du respect des droits de l'homme et des libertés fondamentales. Elle doit favoriser la compréhension, la tolérance et l'amitié entre toutes les nations et tous les groupes raciaux ou religieux, ainsi que le développement des activités des Nations Unies pour le maintien de la paix. 
3. Les parents ont, par priorité, le droit de choisir le genre d'éducation à donner à leurs enfants.
Article 27
1. Toute personne a le droit de prendre part librement à la vie culturelle de la communauté, de jouir des arts et de participer au progrès scientifique et aux bienfaits qui en résultent. 
2. Chacun a droit à la protection des intérêts moraux et matériels découlant de toute production scientifique, littéraire ou artistique dont il est l'auteur.
Article 28
Toute personne a droit à ce que règne, sur le plan social et sur le plan international, un ordre tel que les droits et libertés énoncés dans la présente Déclaration puissent y trouver plein effet.
Article 29
1. L'individu a des devoirs envers la communauté dans laquelle seule le libre et plein développement de sa personnalité est possible. 
2. Dans l'exercice de ses droits et dans la jouissance de ses libertés, chacun n'est soumis qu'aux limitations établies par la loi exclusivement en vue d'assurer la reconnaissance et le respect des droits et libertés d'autrui et afin de satisfaire aux justes exigences de la morale, de l'ordre public et du bien-être général dans une société démocratique. 
3. Ces droits et libertés ne pourront, en aucun cas, s'exercer contrairement aux buts et aux principes des Nations Unies.
Article 30
Aucune disposition de la présente Déclaration ne peut être interprétée comme impliquant pour un État, un groupement ou un individu un droit quelconque de se livrer à une activité ou d'accomplir un acte visant à la destruction des droits et libertés qui y sont énoncés.
`
	declaTextEn = `
Preamble
Whereas recognition of the inherent dignity and of the equal and inalienable rights of all members of the human family is the foundation of freedom, justice and peace in the world,
Whereas disregard and contempt for human rights have resulted in barbarous acts which have outraged the conscience of mankind, and the advent of a world in which human beings shall enjoy freedom of speech and belief and freedom from fear and want has been proclaimed as the highest aspiration of the common people,
Whereas it is essential, if man is not to be compelled to have recourse, as a last resort, to rebellion against tyranny and oppression, that human rights should be protected by the rule of law,
Whereas it is essential to promote the development of friendly relations between nations,
Whereas the peoples of the United Nations have in the Charter reaffirmed their faith in fundamental human rights, in the dignity and worth of the human person and in the equal rights of men and women and have determined to promote social progress and better standards of life in larger freedom,
Whereas Member States have pledged themselves to achieve, in co-operation with the United Nations, the promotion of universal respect for and observance of human rights and fundamental freedoms,
Whereas a common understanding of these rights and freedoms is of the greatest importance for the full realization of this pledge,
Now, Therefore THE GENERAL ASSEMBLY proclaims THIS UNIVERSAL DECLARATION OF HUMAN RIGHTS as a common standard of achievement for all peoples and all nations, to the end that every individual and every organ of society, keeping this Declaration constantly in mind, shall strive by teaching and education to promote respect for these rights and freedoms and by progressive measures, national and international, to secure their universal and effective recognition and observance, both among the peoples of Member States themselves and among the peoples of territories under their jurisdiction. 
Article 1.
All human beings are born free and equal in dignity and rights. They are endowed with reason and conscience and should act towards one another in a spirit of brotherhood.
Article 2.
Everyone is entitled to all the rights and freedoms set forth in this Declaration, without distinction of any kind, such as race, colour, sex, language, religion, political or other opinion, national or social origin, property, birth or other status. Furthermore, no distinction shall be made on the basis of the political, jurisdictional or international status of the country or territory to which a person belongs, whether it be independent, trust, non-self-governing or under any other limitation of sovereignty.
Article 3.
Everyone has the right to life, liberty and security of person.
Article 4.
No one shall be held in slavery or servitude; slavery and the slave trade shall be prohibited in all their forms.
Article 5.
No one shall be subjected to torture or to cruel, inhuman or degrading treatment or punishment.
Article 6.
Everyone has the right to recognition everywhere as a person before the law.
Article 7.
All are equal before the law and are entitled without any discrimination to equal protection of the law. All are entitled to equal protection against any discrimination in violation of this Declaration and against any incitement to such discrimination.
Article 8.
Everyone has the right to an effective remedy by the competent national tribunals for acts violating the fundamental rights granted him by the constitution or by law.
Article 9.
No one shall be subjected to arbitrary arrest, detention or exile.
Article 10.
Everyone is entitled in full equality to a fair and public hearing by an independent and impartial tribunal, in the determination of his rights and obligations and of any criminal charge against him.
Article 11.
(1) Everyone charged with a penal offence has the right to be presumed innocent until proved guilty according to law in a public trial at which he has had all the guarantees necessary for his defence.
(2) No one shall be held guilty of any penal offence on account of any act or omission which did not constitute a penal offence, under national or international law, at the time when it was committed. Nor shall a heavier penalty be imposed than the one that was applicable at the time the penal offence was committed.
Article 12.
No one shall be subjected to arbitrary interference with his privacy, family, home or correspondence, nor to attacks upon his honour and reputation. Everyone has the right to the protection of the law against such interference or attacks.
Article 13.
(1) Everyone has the right to freedom of movement and residence within the borders of each state.
(2) Everyone has the right to leave any country, including his own, and to return to his country.
Article 14.
(1) Everyone has the right to seek and to enjoy in other countries asylum from persecution.
(2) This right may not be invoked in the case of prosecutions genuinely arising from non-political crimes or from acts contrary to the purposes and principles of the United Nations.
Article 15.
(1) Everyone has the right to a nationality.
(2) No one shall be arbitrarily deprived of his nationality nor denied the right to change his nationality.
Article 16.
(1) Men and women of full age, without any limitation due to race, nationality or religion, have the right to marry and to found a family. They are entitled to equal rights as to marriage, during marriage and at its dissolution.
(2) Marriage shall be entered into only with the free and full consent of the intending spouses.
(3) The family is the natural and fundamental group unit of society and is entitled to protection by society and the State.
Article 17.
(1) Everyone has the right to own property alone as well as in association with others.
(2) No one shall be arbitrarily deprived of his property.
Article 18.
Everyone has the right to freedom of thought, conscience and religion; this right includes freedom to change his religion or belief, and freedom, either alone or in community with others and in public or private, to manifest his religion or belief in teaching, practice, worship and observance.
Article 19.
Everyone has the right to freedom of opinion and expression; this right includes freedom to hold opinions without interference and to seek, receive and impart information and ideas through any media and regardless of frontiers.
Article 20.
(1) Everyone has the right to freedom of peaceful assembly and association.
(2) No one may be compelled to belong to an association.
Article 21.
(1) Everyone has the right to take part in the government of his country, directly or through freely chosen representatives.
(2) Everyone has the right of equal access to public service in his country.
(3) The will of the people shall be the basis of the authority of government; this will shall be expressed in periodic and genuine elections which shall be by universal and equal suffrage and shall be held by secret vote or by equivalent free voting procedures.
Article 22.
Everyone, as a member of society, has the right to social security and is entitled to realization, through national effort and international co-operation and in accordance with the organization and resources of each State, of the economic, social and cultural rights indispensable for his dignity and the free development of his personality.
Article 23.
(1) Everyone has the right to work, to free choice of employment, to just and favourable conditions of work and to protection against unemployment.
(2) Everyone, without any discrimination, has the right to equal pay for equal work.
(3) Everyone who works has the right to just and favourable remuneration ensuring for himself and his family an existence worthy of human dignity, and supplemented, if necessary, by other means of social protection.
(4) Everyone has the right to form and to join trade unions for the protection of his interests.
Article 24.
Everyone has the right to rest and leisure, including reasonable limitation of working hours and periodic holidays with pay.
Article 25.
(1) Everyone has the right to a standard of living adequate for the health and well-being of himself and of his family, including food, clothing, housing and medical care and necessary social services, and the right to security in the event of unemployment, sickness, disability, widowhood, old age or other lack of livelihood in circumstances beyond his control.
(2) Motherhood and childhood are entitled to special care and assistance. All children, whether born in or out of wedlock, shall enjoy the same social protection.
Article 26.
(1) Everyone has the right to education. Education shall be free, at least in the elementary and fundamental stages. Elementary education shall be compulsory. Technical and professional education shall be made generally available and higher education shall be equally accessible to all on the basis of merit.
(2) Education shall be directed to the full development of the human personality and to the strengthening of respect for human rights and fundamental freedoms. It shall promote understanding, tolerance and friendship among all nations, racial or religious groups, and shall further the activities of the United Nations for the maintenance of peace.
(3) Parents have a prior right to choose the kind of education that shall be given to their children.
Article 27.
(1) Everyone has the right freely to participate in the cultural life of the community, to enjoy the arts and to share in scientific advancement and its benefits.
(2) Everyone has the right to the protection of the moral and material interests resulting from any scientific, literary or artistic production of which he is the author.
Article 28.
Everyone is entitled to a social and international order in which the rights and freedoms set forth in this Declaration can be fully realized.
Article 29.
(1) Everyone has duties to the community in which alone the free and full development of his personality is possible.
(2) In the exercise of his rights and freedoms, everyone shall be subject only to such limitations as are determined by law solely for the purpose of securing due recognition and respect for the rights and freedoms of others and of meeting the just requirements of morality, public order and the general welfare in a democratic society.
(3) These rights and freedoms may in no case be exercised contrary to the purposes and principles of the United Nations.
Article 30.
Nothing in this Declaration may be interpreted as implying for any State, group or person any right to engage in any activity or to perform any act aimed at the destruction of any of the rights and freedoms set forth herein.
`
)

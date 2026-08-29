import type { TourApiItem } from "@/infrastructure/tourapi/tourapi-types";

/**
 * mock 데이터는 **실제 TourAPI 응답 스키마를 그대로 따른다.**
 * 키가 없어도 화면을 만들 수 있게 하고, 키가 들어오면 플래그만 끄면 되도록 하기 위해서다.
 *
 * 값은 실제 EngService2 / KorService2 응답에서 관찰한 형태를 재현했다 —
 * 영문 title 은 `로마자 (한글)`, 이미지는 3:2, cpyrhtDivCd 는 Type3 이 다수다.
 */

export const MOCK_EN: TourApiItem[] = [
  {
    contentid: "264337", contenttypeid: "76",
    title: "Gyeongbokgung Palace (경복궁)",
    addr1: "161, Sajik-ro, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "126.9769930325", mapy: "37.5760836609",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/23/2678023_image2_1.jpg",
    firstimage2: "https://tong.visitkorea.or.kr/cms/resource/23/2678023_image3_1.jpg",
    cpyrhtDivCd: "Type3", tel: "+82-2-3700-3900", modifiedtime: "20251023143000",
    lclsSystm1: "HS", lclsSystm2: "HS01", lclsSystm3: "HS010100",
    overview: "Gyeongbokgung Palace was the main royal palace of the Joseon dynasty.<br>Built in 1395, it is the largest of the Five Grand Palaces.",
    homepage: "<a href=\"https://www.royalpalace.go.kr\" target=\"_blank\">www.royalpalace.go.kr</a>",
    usetime: "09:00-18:00", restdate: "Tuesdays", infocenter: "+82-2-3700-3900",
  },
  {
    contentid: "264570", contenttypeid: "76",
    title: "Cheonggyecheon Stream (청계천)",
    addr1: "Changsin-dong, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "126.9784148", mapy: "37.5691287",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/64/1701164_image2_1.jpg",
    firstimage2: "https://tong.visitkorea.or.kr/cms/resource/64/1701164_image3_1.jpg",
    cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250910120000",
    lclsSystm1: "NA", lclsSystm2: "NA02", lclsSystm3: "NA020200",
  },
  {
    contentid: "1349267", contenttypeid: "76",
    title: "Achasan Mountain (아차산)",
    addr1: "Gwangjang-dong, Gwangjin-gu, Seoul", areacode: "1", sigungucode: "6",
    mapx: "127.1019", mapy: "37.5670",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/11/2660711_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type1", tel: "", modifiedtime: "20250801090000",
    lclsSystm1: "NA", lclsSystm2: "NA03", lclsSystm3: "NA030200",
  },
  {
    // 의료관광. isDisplayableOnWall 이 배제해야 한다 (EX050800)
    contentid: "3365278", contenttypeid: "76",
    title: "1stbutton Rhinoplasty clinic (첫단추의원)",
    addr1: "483 Gangnam-daero, Seocho-gu, Seoul", areacode: "1", sigungucode: "15",
    mapx: "127.0236686375", mapy: "37.5053871607",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/00/0000000_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type1", tel: "", modifiedtime: "20251023143000",
    lclsSystm1: "EX", lclsSystm2: "EX05", lclsSystm3: "EX050800",
  },
  {
    // 이미지 없음. isDisplayableOnWall 이 배제해야 한다
    contentid: "3364714", contenttypeid: "76",
    title: "21 Century Hospital (서울21세기병원)",
    addr1: "Gangnam-gu, Seoul", areacode: "1", sigungucode: "1",
    mapx: "127.0276", mapy: "37.4979",
    firstimage: "", firstimage2: "", cpyrhtDivCd: "", tel: "", modifiedtime: "20250101000000",
    lclsSystm1: "EX", lclsSystm2: "EX05", lclsSystm3: "EX050800",
  },
  {
    contentid: "3400953", contenttypeid: "78",
    title: "ARKO Art Center (아르코미술관)",
    addr1: "3 Dongsung-gil, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "127.0022", mapy: "37.5820",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/53/3400953_image2_1.jpg",
    firstimage2: "https://tong.visitkorea.or.kr/cms/resource/53/3400953_image3_1.jpg",
    cpyrhtDivCd: "Type3", tel: "+82-2-760-4850", modifiedtime: "20250620110000",
    lclsSystm1: "VE", lclsSystm2: "VE06", lclsSystm3: "VE060100",
  },
  {
    contentid: "3544517", contenttypeid: "82",
    title: "ARTEASPOON (아티스푼)",
    addr1: "Seongdong-gu, Seoul", areacode: "1", sigungucode: "16",
    mapx: "127.0400", mapy: "37.5450",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/17/3544517_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250715140000",
    lclsSystm1: "FD", lclsSystm2: "FD01", lclsSystm3: "FD010200",
  },

  /*
    ── 여기부터는 QA 용으로 지어낸 항목이다 ──

    위의 일곱 건과 성격이 다르다. 저것들은 실제 응답에서 관찰한 값이고, 아래는
    **자동 QA 가 판정할 수 있는 양을 만들기 위해 구성한 것**이다. 섞이지 않게
    선을 긋는다 — 나중에 "이 값이 공급자에게서 온 것인가" 를 물을 수 있어야 한다.

    지어낸 것과 사실인 것:
    - `contentid` 는 **가공값**이다. 형식(숫자열)만 맞췄고 실제 ID 가 아니다
    - 이름·주소·좌표는 실재하는 장소의 공개 정보이고 좌표는 근사값이다
    - `firstimage` 는 **위 항목들의 실제 URL 을 돌려 쓴다.** 지어낸 URL 은 404 가
      되어 화면이 깨지고, 그러면 "이미지가 없다" 와 구분되지 않는다. 같은 사진이
      여러 카드에 뜨는 편이 낫다

    수를 이렇게 잡은 이유: 관광지(76)에 **표시 가능한 것이 15건**이라 한 묶음(12)을
    넘긴다. 그래야 `hasMore` 가 참이 되어 더보기 버튼이 렌더되고, 그것을 누르는
    TC 를 돌릴 수 있다. 12건 이하로 줄이면 그 버튼이 화면에서 사라진다.

    지역도 섞는다. 서울만 있으면 시도 필터를 바꿔도 결과가 늘 비어, 필터가
    동작하는지와 데이터가 없는지를 가를 수 없다.
  */
  {
    contentid: "2640001", contenttypeid: "76",
    title: "Bukchon Hanok Village (북촌한옥마을)",
    addr1: "37 Gyedong-gil, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "126.9850", mapy: "37.5826",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/23/2678023_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "HS", lclsSystm2: "HS01", lclsSystm3: "HS010200",
  },
  {
    contentid: "2640002", contenttypeid: "76",
    title: "N Seoul Tower (남산서울타워)",
    addr1: "105 Namsangongwon-gil, Jung-gu, Seoul", areacode: "1", sigungucode: "24",
    mapx: "126.9882", mapy: "37.5512",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/64/1701164_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "VE", lclsSystm2: "VE03", lclsSystm3: "VE030100",
  },
  {
    contentid: "2640003", contenttypeid: "76",
    title: "Changdeokgung Palace (창덕궁)",
    addr1: "99 Yulgok-ro, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "126.9910", mapy: "37.5794",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/11/2660711_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "HS", lclsSystm2: "HS01", lclsSystm3: "HS010100",
  },
  {
    contentid: "2640004", contenttypeid: "76",
    title: "Seoul Forest (서울숲)",
    addr1: "273 Ttukseom-ro, Seongdong-gu, Seoul", areacode: "1", sigungucode: "16",
    mapx: "127.0374", mapy: "37.5444",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/53/3400953_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "NA", lclsSystm2: "NA02", lclsSystm3: "NA020100",
  },
  {
    contentid: "2640005", contenttypeid: "76",
    title: "Hongdae Street (홍대거리)",
    addr1: "Eoulmadang-ro, Mapo-gu, Seoul", areacode: "1", sigungucode: "13",
    mapx: "126.9236", mapy: "37.5563",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/17/3544517_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "VE", lclsSystm2: "VE03", lclsSystm3: "VE030200",
  },
  {
    contentid: "2640006", contenttypeid: "76",
    title: "Ihwa Mural Village (이화벽화마을)",
    addr1: "49 Naksan 4-gil, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "127.0074", mapy: "37.5794",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/90/3467490_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "VE", lclsSystm2: "VE03", lclsSystm3: "VE030200",
  },
  {
    contentid: "2640007", contenttypeid: "76",
    title: "Gwangjang Market (광장시장)",
    addr1: "88 Changgyeonggung-ro, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "126.9997", mapy: "37.5701",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/23/2678023_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "VE", lclsSystm2: "VE04", lclsSystm3: "VE040100",
  },
  {
    contentid: "2640008", contenttypeid: "76",
    title: "Hwaseong Fortress (수원화성)",
    addr1: "320-2 Yeonghwa-dong, Jangan-gu, Suwon-si, Gyeonggi-do",
    areacode: "31", sigungucode: "",
    mapx: "127.0129", mapy: "37.2881",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/64/1701164_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "HS", lclsSystm2: "HS01", lclsSystm3: "HS010200",
  },
  {
    contentid: "2640009", contenttypeid: "76",
    title: "Everland (에버랜드)",
    addr1: "199 Everland-ro, Cheoin-gu, Yongin-si, Gyeonggi-do",
    areacode: "31", sigungucode: "",
    mapx: "127.2020", mapy: "37.2941",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/11/2660711_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "VE", lclsSystm2: "VE01", lclsSystm3: "VE010100",
  },
  {
    contentid: "2640010", contenttypeid: "76",
    title: "Seongsan Ilchulbong Peak (성산일출봉)",
    addr1: "284-12 Ilchul-ro, Seogwipo-si, Jeju-do", areacode: "39", sigungucode: "",
    mapx: "126.9403", mapy: "33.4581",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/53/3400953_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "NA", lclsSystm2: "NA01", lclsSystm3: "NA010100",
  },
  {
    contentid: "2640011", contenttypeid: "76",
    title: "Hallasan Mountain (한라산)",
    addr1: "Jeju-si, Jeju-do", areacode: "39", sigungucode: "",
    mapx: "126.5312", mapy: "33.3617",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/17/3544517_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "NA", lclsSystm2: "NA01", lclsSystm3: "NA010100",
  },
  {
    contentid: "2640012", contenttypeid: "76",
    title: "Haeundae Beach (해운대해수욕장)",
    addr1: "264 Haeundaehaebyeon-ro, Haeundae-gu, Busan", areacode: "6", sigungucode: "",
    mapx: "129.1603", mapy: "35.1587",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/90/3467490_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "NA", lclsSystm2: "NA01", lclsSystm3: "NA010300",
  },
  {
    contentid: "2640013", contenttypeid: "76",
    title: "Gamcheon Culture Village (감천문화마을)",
    addr1: "203 Gamnae 2-ro, Saha-gu, Busan", areacode: "6", sigungucode: "",
    mapx: "129.0107", mapy: "35.0975",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/23/2678023_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "VE", lclsSystm2: "VE03", lclsSystm3: "VE030200",
  },

  /* 문화시설 — 분류를 바꿨을 때도 결과가 남아야 탭 전환을 판정할 수 있다 */
  {
    contentid: "2640020", contenttypeid: "78",
    title: "National Museum of Korea (국립중앙박물관)",
    addr1: "137 Seobinggo-ro, Yongsan-gu, Seoul", areacode: "1", sigungucode: "24",
    mapx: "126.9803", mapy: "37.5240",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/64/1701164_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "VE", lclsSystm2: "VE06", lclsSystm3: "VE060200",
  },
  {
    contentid: "2640021", contenttypeid: "78",
    title: "Leeum Museum of Art (리움미술관)",
    addr1: "60-16 Itaewon-ro 55-gil, Yongsan-gu, Seoul", areacode: "1", sigungucode: "24",
    mapx: "126.9995", mapy: "37.5384",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/11/2660711_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "VE", lclsSystm2: "VE06", lclsSystm3: "VE060100",
  },

  /* 음식점 */
  {
    contentid: "2640030", contenttypeid: "82",
    title: "Tosokchon Samgyetang (토속촌삼계탕)",
    addr1: "5 Jahamun-ro 5-gil, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "126.9709", mapy: "37.5779",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/53/3400953_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "FD", lclsSystm2: "FD01", lclsSystm3: "FD010100",
  },
  {
    contentid: "2640031", contenttypeid: "82",
    title: "Jinju Hoegwan (진주회관)",
    addr1: "26 Sejong-daero 11-gil, Jung-gu, Seoul", areacode: "1", sigungucode: "24",
    mapx: "126.9765", mapy: "37.5648",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/17/3544517_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "FD", lclsSystm2: "FD01", lclsSystm3: "FD010100",
  },

  /* 축제 — 이 분류가 비면 탭 하나가 늘 빈 상태가 되어 그 탭의 TC 가 못 돈다 */
  {
    contentid: "2640040", contenttypeid: "85",
    title: "Seoul Lantern Festival (서울빛초롱축제)",
    addr1: "Cheonggyecheon-ro, Jongno-gu, Seoul", areacode: "1", sigungucode: "23",
    mapx: "126.9784", mapy: "37.5691",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/90/3467490_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "EV", lclsSystm2: "EV01", lclsSystm3: "EV010200",
  },
  {
    contentid: "2640041", contenttypeid: "85",
    title: "Busan Fireworks Festival (부산불꽃축제)",
    addr1: "Gwangalli Beach, Suyeong-gu, Busan", areacode: "6", sigungucode: "",
    mapx: "129.1187", mapy: "35.1532",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/23/2678023_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250901120000",
    lclsSystm1: "EV", lclsSystm2: "EV01", lclsSystm3: "EV010200",
  },
];

export const MOCK_KO: TourApiItem[] = [
  {
    contentid: "264337", contenttypeid: "12",
    title: "경복궁",
    addr1: "서울특별시 종로구 사직로 161", areacode: "1", sigungucode: "23",
    mapx: "126.9769930325", mapy: "37.5760836609",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/23/2678023_image2_1.jpg",
    firstimage2: "https://tong.visitkorea.or.kr/cms/resource/23/2678023_image3_1.jpg",
    cpyrhtDivCd: "Type3", tel: "02-3700-3900", modifiedtime: "20251023143000",
    lclsSystm1: "HS", lclsSystm2: "HS01", lclsSystm3: "HS010100",
  },
  {
    contentid: "742972", contenttypeid: "12",
    title: "아차산 어울림정원",
    addr1: "서울특별시 광진구 광장동", areacode: "1", sigungucode: "6",
    mapx: "127.1019", mapy: "37.5670",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/11/2660711_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type1", tel: "", modifiedtime: "20250801090000",
    lclsSystm1: "NA", lclsSystm2: "NA03", lclsSystm3: "NA030200",
  },
  {
    contentid: "1116925", contenttypeid: "12",
    title: "갈산공원",
    addr1: "서울특별시 양천구 신정동 162-56", areacode: "1", sigungucode: "19",
    mapx: "126.8560", mapy: "37.5170",
    firstimage: "https://tong.visitkorea.or.kr/cms/resource/90/3467490_image2_1.jpg",
    firstimage2: "", cpyrhtDivCd: "Type3", tel: "", modifiedtime: "20250505100000",
    lclsSystm1: "NA", lclsSystm2: "NA02", lclsSystm3: "NA020100",
  },
];

/**
 * areaCode2 를 `areaCode` 없이 부르면 오는 시도 목록.
 *
 * **여기 있는 코드는 목 스팟이 실제로 갖는 것이어야 한다.** 목록에만 있고 스팟이
 * 없는 시도를 두면, 그것을 골랐을 때 나오는 빈 화면이 "필터가 동작한 결과" 인지
 * "데이터가 없는 것" 인지 구분되지 않는다. 넷 다 스팟을 갖는다 —
 * 서울 다수 · 경기 2 · 제주 2 · 부산 3.
 *
 * `MockSpotRepository.list` 는 `areaCode` 를 실제로 거른다. 형태가 맞는데
 * 스팟이 없는 코드(예: 99)를 넣으면 빈 상태 화면이 뜬다. 반면 형태가 틀린
 * 값(예: 99999)은 `isAreaCode` 가 먼저 걸러 **필터 없음**이 되고 전국 목록이
 * 나온다 — 둘은 다른 동작이다.
 */
export const MOCK_AREAS_EN: TourApiItem[] = [
  { code: "1", name: "Seoul" },
  { code: "6", name: "Busan" },
  { code: "31", name: "Gyeonggi-do" },
  { code: "39", name: "Jeju-do" },
];

export const MOCK_AREAS_KO: TourApiItem[] = [
  { code: "1", name: "서울" },
  { code: "6", name: "부산" },
  { code: "31", name: "경기도" },
  { code: "39", name: "제주도" },
];

/**
 * 서울(areaCode=1)의 시군구. 이름이 로케일마다 다르다.
 *
 * **서울만 시군구를 갖는다.** 다른 시도를 고르면 `listDistricts` 가 빈 배열을
 * 주고 2단 필터가 나타나지 않는다 — 시군구 UI 를 보려면 서울을 골라야 한다.
 */
export const MOCK_DISTRICTS_EN: TourApiItem[] = [
  { code: "1", name: "Gangnam-gu" }, { code: "6", name: "Gwangjin-gu" },
  { code: "13", name: "Mapo-gu" }, { code: "15", name: "Seocho-gu" },
  { code: "16", name: "Seongdong-gu" }, { code: "19", name: "Yangcheon-gu" },
  { code: "23", name: "Jongno-gu" }, { code: "24", name: "Jung-gu" },
];

export const MOCK_DISTRICTS_KO: TourApiItem[] = [
  { code: "1", name: "강남구" }, { code: "6", name: "광진구" },
  { code: "13", name: "마포구" }, { code: "15", name: "서초구" },
  { code: "16", name: "성동구" }, { code: "19", name: "양천구" },
  { code: "23", name: "종로구" }, { code: "24", name: "중구" },
];

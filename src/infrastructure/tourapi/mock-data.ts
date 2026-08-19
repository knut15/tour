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

/** areaCode2 응답 형태. 이름이 로케일마다 다르다. */
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

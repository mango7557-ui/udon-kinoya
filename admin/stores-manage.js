/* 매장 관리(서울지역 / 전국 각지) 신규 매장 CRUD + 45개 전체 매장 사진 외 데이터(엑셀 전 항목) 직접 입력/수정 + 2개 시트('서울지역', '전국 각지') 엑셀 다운로드·업로드·참조 불러오기 */
(function(){
  'use strict';
  const A = window.AdminCore;
  const REGION_LABELS = {
    seoul: '서울지역',
    gyeonggi: '경기',
    incheon: '인천',
    chungcheong: '충청',
    daegu: '대구',
    busan: '부산',
    jeju: '제주'
  };
  const LABEL_TO_REGION = {
    '서울': 'seoul', '서울지역': 'seoul', '서울 지역': 'seoul', 'seoul': 'seoul',
    '경기': 'gyeonggi', '전국 각지 · 경기': 'gyeonggi', 'gyeonggi': 'gyeonggi',
    '인천': 'incheon', '전국 각지 · 인천': 'incheon', 'incheon': 'incheon',
    '충청': 'chungcheong', '충남': 'chungcheong', '충북': 'chungcheong', '전국 각지 · 충청': 'chungcheong', 'chungcheong': 'chungcheong',
    '대구': 'daegu', '전국 각지 · 대구': 'daegu', 'daegu': 'daegu',
    '부산': 'busan', '전국 각지 · 부산': 'busan', 'busan': 'busan',
    '제주': 'jeju', '전국 각지 · 제주': 'jeju', 'jeju': 'jeju'
  };
  const EXCEL_HEADERS = ['매장코드', '지역', '매장명', '주소', '영업시간', '휴무일', '한줄소개', '전화번호', '사진경로', '네이버맵링크', '구글맵링크', '카카오맵링크', '티맵링크', '상세페이지링크', '표시순서', '공개여부'];

  function splitHoursClosed(rawHours) {
    const str = String(rawHours || '').replace(/^🕒\s*/, '').trim();
    if (!str) return { hours: '', closed_days: '' };
    const parts = str.split(/\s*·\s*/);
    if (parts.length >= 2) {
      return { hours: parts[0].trim(), closed_days: parts.slice(1).join(' · ').trim() };
    }
    return { hours: str, closed_days: '' };
  }

  function joinHoursClosed(hours, closed) {
    const h = String(hours || '').replace(/^🕒\s*/, '').trim();
    const c = String(closed || '').trim();
    if (!h && !c) return '';
    return '🕒 ' + (h && c ? (h + ' · ' + c) : (h || c));
  }

  function escapeHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  const BUILTIN_BASE_STORES = [
    {num:'2',region:'seoul',name:'우동키노야 용산직영점 (신용산본점)',address:'서울 용산구 한강대로7길 18-13 1층',hours_combined:'🕒 11:00 ~ 20:00 (재료 소진 시 조기마감) · 연중무휴 / 인스타그램 공지',meta:'🍜 직영점, 신용산역/용산역 인근, 장어튀김붓카케 및 토리텐 인기',phone:'0507-1408-1984',detail_url:'yongsan/',naver_map_url:'https://map.naver.com/p/search/%EC%9A%B0%EB%8F%99%ED%82%A4%EB%85%B8%EC%95%BC%20%EC%9A%A9%EC%82%B0%EC%A7%81%EC%98%81%EC%A0%90(%EC%8B%A0%EC%9A%A9%EC%82%B0%EB%B3%B8%EC%A0%90)',sort_order:1},
    {num:'3',region:'seoul',name:'우동키노야 마곡점',address:'서울 강서구 마곡동로3길 6 1층 102,103호',hours_combined:'🕒 평일 11:00 ~ 21:30 (BT 15:00~17:00, LO 20:30), 주말 11:30 ~ 21:00 · 연중무휴',meta:'🍜 발산역/마곡역 역세권, 직장인 점심/저녁 맛집, 주차 가능',phone:'0507-1314-3549',detail_url:'magok/',naver_map_url:'https://map.naver.com/p/search/%EC%9A%B0%EB%8F%99%ED%82%A4%EB%85%B8%EC%95%BC%20%EB%A7%88%EA%B3%A1%EC%A0%90',sort_order:2},
    {num:'5',region:'seoul',name:'우동키노야 을지로점',address:'서울 중구 마른내로 71 1층',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 일요일 정기휴무',meta:'🍜 을지로3가/을지로4가 인근, 직장인 핫플',phone:'0507-1465-7823',detail_url:'euljiro/',naver_map_url:'https://naver.me/F1aDB6O9',sort_order:3},
    {num:'6',region:'seoul',name:'우동키노야 합정점',address:'서울 마포구 양화로 45 메세나폴리스 몰동 B1103, B1104호',hours_combined:'🕒 11:00 ~ 21:00 (LO 20:30) · 연중무휴',meta:'🍜 합정역 메세나폴리스 지하 1층 위치, 몰 내 주차 가능',phone:'0507-1439-1984',detail_url:'hapjeong/',naver_map_url:'https://naver.me/GDLrlLKr',sort_order:4},
    {num:'7',region:'seoul',name:'우동키노야 중앙대점',address:'서울 동작구 흑석로 81 2층',hours_combined:'🕒 10:30 ~ 20:30 (BT 15:00~16:30, LO 20:00) · 매주 일요일 정기휴무',meta:'🍜 중앙대학교 정문 및 흑석역 인근, 학생 할인 및 가성비 세트',phone:'0507-1391-6412',detail_url:'',sort_order:5},
    {num:'9',region:'seoul',name:'우동키노야 신촌숲길점',address:'서울 마포구 신촌로16길 29 에피소드 신촌369 1층 102호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 신촌역 및 경의선숲길 인근, 청년 복합문화공간 1층',phone:'0507-1485-7762',detail_url:'',sort_order:6},
    {num:'12',region:'seoul',name:'우동키노야 강남신논현역점',address:'서울 서초구 서운로26길 11 1층',hours_combined:'🕒 11:00 ~ 21:30 (BT 15:00~17:00, LO 21:00) · 연중무휴',meta:'🍜 신논현역/강남역 인근 교보타워 후문 골목 위치',phone:'0507-1325-4804',detail_url:'',sort_order:7},
    {num:'15',region:'seoul',name:'우동키노야 구로디지털단지점',address:'서울 구로구 디지털로 300 지밸리비즈플라자 1층 108호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴 (주말 정상영업)',meta:'🍜 구디 지밸리몰 1층 위치, 직장인 인기, 건물 주차 가능',phone:'0507-1369-3389',detail_url:'guro/',sort_order:8},
    {num:'21',region:'seoul',name:'우동키노야 신림점',address:'서울 관악구 신림로 317 1층, 2층 3호',hours_combined:'🕒 11:00 ~ 21:30 (LO 21:00) · 연중무휴',meta:'🍜 신림역 3번 출구 인근, 1~2층 복층 운영',phone:'02-882-0734',detail_url:'',sort_order:9},
    {num:'23',region:'seoul',name:'우동키노야 미아역점',address:'서울 강북구 도봉로 184 1층',hours_combined:'🕒 11:00 ~ 21:00 (LO 20:30) · 연중무휴',meta:'🍜 미아역 4번 출구 바로 앞 대로변 위치',phone:'02-980-8089',detail_url:'',sort_order:10},
    {num:'25',region:'seoul',name:'우동키노야 왕십리점',address:'서울 성동구 왕십리로 410 센트라스 아이동 1층 123호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 상왕십리역 센트라스 상가 1층 위치, 주차 편리',phone:'02-2299-0144',detail_url:'',sort_order:11},
    {num:'26',region:'seoul',name:'우동키노야 방배카페골목점',address:'서울 서초구 방배중앙로 214 배원빌딩 2층',hours_combined:'🕒 11:00 ~ 21:30 (BT 15:00~17:00, LO 21:00) · 연중무휴',meta:'🍜 방배동 카페골목 중심부 2층, 쾌적하고 넓은 매장',phone:'02-532-6565',detail_url:'',sort_order:12},
    {num:'27',region:'seoul',name:'우동키노야 성수점',address:'서울 성동구 성수이로12길 13 1층',hours_combined:'🕒 11:00 ~ 21:30 (BT 15:00~17:00, LO 20:45) · 연중무휴',meta:'🍜 성수동 카페거리 인근, 감성 인테리어 및 핫플레이스',phone:'0507-1403-2182',detail_url:'',sort_order:13},
    {num:'28',region:'seoul',name:'우동키노야 대학로점',address:'서울 종로구 대학로12길 50 2층',hours_combined:'🕒 11:00 ~ 21:00 (LO 20:00) · 연중무휴',meta:'🍜 혜화역 2번 출구 도보 3분, 마로니에공원/연극거리 인근',phone:'02-744-2644',detail_url:'',sort_order:14},
    {num:'29',region:'seoul',name:'우동키노야 건대점',address:'서울 광진구 아차산로 218 1층 103호',hours_combined:'🕒 11:00 ~ 21:30 (LO 21:00) · 연중무휴',meta:'🍜 건대입구역 6번 출구 커먼그라운드 맞은편 위치',phone:'02-2205-5589',detail_url:'',sort_order:15},
    {num:'32',region:'seoul',name:'우동키노야 잠실점',address:'서울 송파구 올림픽로34길 3-36 1층 103호',hours_combined:'🕒 11:00 ~ 21:30 (BT 15:00~17:00, LO 21:00) · 연중무휴',meta:'🍜 방이동 먹자골목 및 잠실역/송파나루역 인근',phone:'070-4790-9668',detail_url:'',sort_order:16},
    {num:'33',region:'seoul',name:'우동키노야 상암점',address:'서울 마포구 월드컵북로 402 KGIT센터 1층 145호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 토/일 주말 정기휴무 (오피스 상권)',meta:'🍜 DMC 디지털미디어시티 KGIT센터 1층, 방송국 직장인 핫플',phone:'02-6393-5177',detail_url:'',sort_order:17},
    {num:'35',region:'seoul',name:'우동키노야 강남역점',address:'서울 서초구 강남대로53길 7 1층',hours_combined:'🕒 11:00 ~ 22:00 (BT 15:30~17:00, LO 21:15) · 연중무휴',meta:'🍜 강남역 5번 출구 이면 먹자골목 위치, 빠른 회전율',phone:'02-597-5184',detail_url:'',sort_order:18},
    {num:'36',region:'seoul',name:'우동키노야 금천구청역점',address:'서울 금천구 시흥대로63길 64 1층 102호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 금천구청역 도보 5분, 엠메디컬스퀘어 상가 1층',phone:'070-8287-3772',detail_url:'',sort_order:19},
    {num:'37',region:'seoul',name:'우동키노야 강남도곡점',address:'서울 강남구 논현로38길 24 1층',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 일요일 정기휴무',meta:'🍜 매봉역 4번 출구 인근, 강남세브란스/도곡동 주거단지 인근',phone:'02-6091-9000',detail_url:'',sort_order:20},
    {num:'40',region:'seoul',name:'우동키노야 염창역점',address:'서울 양천구 공항대로 638 지하1층 B105호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 염창역 4번 출구 연결 상가 지하 1층 위치',phone:'0507-1335-7107',detail_url:'yeomchang/',sort_order:21},
    {num:'42',region:'seoul',name:'우동키노야 외대점',address:'서울 동대문구 이문로 120 상가동 C109호',hours_combined:'🕒 10:30 ~ 20:30 (BT 15:00~16:30, LO 20:00) · 매주 일요일 정기휴무',meta:'🍜 외대앞역 및 한국외국어대학교 정문 인근 상가 1층',phone:'070-8834-1310',detail_url:'',sort_order:22},
    {num:'46',region:'seoul',name:'우동키노야 삼성점',address:'서울 강남구 삼성로 549, 1층 103호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 일요일 정기휴무',meta:'🍜 삼성중앙역 6번 출구에서 265m',phone:'02-564-5769',detail_url:'',sort_order:23},
    {num:'48',region:'seoul',name:'우동키노야 용두점',address:'서울특별시 동대문구 고산자로 420, 근린생활시설동 1층 116호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 용두역 2번 출구에서 378m',phone:'070-4006-5098',detail_url:'',sort_order:24},
    {num:'49',region:'seoul',name:'우동키노야 보라매점',address:'서울 동작구 보라매로5가길 16, 아카데미타워 1층, 101-1호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 보라매병원역 2번 출구에서 171m',phone:'070-7798-1982',detail_url:'',sort_order:25},
    {num:'51',region:'seoul',name:'우동키노야 가양역점',address:'서울특별시 강서구 양천로 500, 1층 107호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 일요일 정기휴무',meta:'🍜 가양역 6번 출구에서 4m',phone:'070-8814-1982',detail_url:'gayang/',sort_order:26},
    {num:'1',region:'gyeonggi',name:'우동키노야 구리본점',address:'경기 구리시 검배로 5 우진빌딩 1층',hours_combined:'🕒 10:30 ~ 15:00 (점심 3.5시간 한정 영업 / 재료 소진 시 조기 마감) · 매주 월요일 정기휴무',meta:'🍜 본점, 자가제면 48시간 숙성 생면(80cm), 일 최고매출 300만원 달성 명소, 웨이팅 필수',phone:'010-4586-0701',photo:'images/store-guri-exterior.jpg',detail_url:'guri/',sort_order:1},
    {num:'8',region:'gyeonggi',name:'우동키노야 금정AK플라자점',address:'경기 군포시 엘에스로 143 AK플라자 금정점 2층 2013호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:15) · AK플라자 금정점 휴무일 준수',meta:'🍜 금정역 연결 AK플라자 2층 푸드존 위치, 쇼핑몰 주차 가능',phone:'0507-1449-0796',detail_url:'',sort_order:2},
    {num:'10',region:'gyeonggi',name:'우동키노야 하남미사점',address:'경기 하남시 미사강변북로30번길 114 1층',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 월요일 정기휴무',meta:'🍜 미사강변 주택상가단지 위치, 매장 앞 주차 가능',phone:'0507-1332-8318',detail_url:'hanammisa/',sort_order:3},
    {num:'11',region:'gyeonggi',name:'우동키노야 일산차병원점',address:'경기 고양시 일산동구 중앙로 1205 1층 107호',hours_combined:'🕒 11:00 ~ 20:30 (BT 15:00~16:30, LO 20:00) · 연중무휴',meta:'🍜 마두역 일산차병원 건물 1층 상가, 병원/상가 주차장 이용',phone:'0507-1324-2139',detail_url:'',sort_order:4},
    {num:'13',region:'gyeonggi',name:'우동키노야 용인역북점',address:'경기 용인시 처인구 중부대로 1294 405호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 용인 명지대역 역북지구 메인상가 4층, 지하 주차 완비',phone:'0507-1382-2000',detail_url:'',sort_order:5},
    {num:'14',region:'gyeonggi',name:'우동키노야 롯데프리미엄아울렛 파주점',address:'경기 파주시 회동길 390 A블럭 3층',hours_combined:'🕒 10:30 ~ 21:00 (LO 20:30) · 롯데프리미엄아울렛 파주점 휴무일 준수',meta:'🍜 파주 롯데아울렛 A블럭 3층 식당가 위치, 무료 주차',phone:'0507-1323-6400',detail_url:'',sort_order:6},
    {num:'16',region:'gyeonggi',name:'우동키노야 현대프리미엄아울렛 김포점',address:'경기 김포시 고촌읍 전호리 654 이스트동 3층 h키친',hours_combined:'🕒 10:30 ~ 20:30 (금/토/일 21:00까지, LO 30분전) · 현대프리미엄아울렛 김포점 휴무일 준수',meta:'🍜 김포현아 이스트동 3층 푸드코트(h\'_Kitchen) 내 입점',phone:'0507-1447-2395',detail_url:'',sort_order:7},
    {num:'17',region:'gyeonggi',name:'우동키노야 수원인계점',address:'경기 수원시 팔달구 효원로265번길 36 혁재빌딩 1층 102호',hours_combined:'🕒 11:00 ~ 21:30 (BT 15:30~17:00, LO 21:00) · 연중무휴',meta:'🍜 수원시청역 나혜석거리 인근, 마제우동 및 냉우동 인기',phone:'0507-1306-2704',detail_url:'',sort_order:8},
    {num:'18',region:'gyeonggi',name:'우동키노야 판교파미어스몰점',address:'경기 성남시 수정구 창업로 17 D동 2층 207-2호',hours_combined:'🕒 11:00 ~ 20:30 (BT 15:00~16:30, LO 20:00) · 파미어스몰 휴무일 준수',meta:'🍜 판교 제2테크노밸리 파미어스몰 2층, 주차 편리',phone:'0507-1382-2455',detail_url:'',sort_order:9},
    {num:'20',region:'gyeonggi',name:'우동키노야 김포구래점',address:'경기 김포시 김포한강9로76번길 49 1동 1층 111, 112호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 화요일 정기휴무',meta:'🍜 구래역 메인상권 위치, 포인트프라자 상가 주차 지원',phone:'070-4352-6473',detail_url:'',sort_order:10},
    {num:'22',region:'gyeonggi',name:'우동키노야 안양평촌점',address:'경기 안양시 동안구 시민대로 317 143, 144호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 일요일 정기휴무',meta:'🍜 평촌 스마트스퀘어 인근 대한스마트타워 상가 위치',phone:'031-424-7838',detail_url:'',sort_order:11},
    {num:'24',region:'gyeonggi',name:'우동키노야 서현점',address:'경기 성남시 분당구 분당로53번길 11 1층',hours_combined:'🕒 11:00 ~ 21:30 (BT 15:30~17:00, LO 21:00) · 연중무휴',meta:'🍜 서현역 로데오거리 위치, 분당 직장인 및 학생 인기',phone:'02-532-6565',detail_url:'',sort_order:12},
    {num:'31',region:'gyeonggi',name:'우동키노야 양평점',address:'경기 양평군 양평읍 중앙로 78 1층',hours_combined:'🕒 11:00 ~ 20:30 (LO 20:00) · 매주 수요일 정기휴무',meta:'🍜 양평역 및 양평군청 인근, 전용 주차공간 보유',phone:'031-771-4229',detail_url:'',sort_order:13},
    {num:'39',region:'gyeonggi',name:'우동키노야 과천점 (과천역점)',address:'경기 과천시 별양상가3로 14 1층 102호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 정부과천청사역/과천역 중심상업지구 위치',phone:'0507-1461-5558',detail_url:'',sort_order:14},
    {num:'47',region:'gyeonggi',name:'우동키노야 고양터미널점',address:'경기도 고양시 일산동구 중앙로 1036 고양종합터미널점 지하1층 T12-1호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 백석역 8번 출구에서 198m',phone:'031-936-7645',detail_url:'',sort_order:15},
    {num:'50',region:'gyeonggi',name:'우동키노야 정자역점',address:'경기 성남시 분당구 정자동 25-1, 킨스타워 1층',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 정자역 3번 출구에서 167m',phone:'070-4240-5337',detail_url:'',sort_order:16},
    {num:'53',region:'gyeonggi',name:'우동키노야 광교상현점',address:'경기도 용인시 수지구 상현동 1132 1층',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 상현역 1번 출구에서 143m',phone:'070-4244-1982',detail_url:'',sort_order:17},
    {num:'45',region:'incheon',name:'우동키노야 영종하늘도시점',address:'인천 중구 하늘중앙로195번길 14, 이은스퀘어 1층',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 영종하늘도시 구읍뱃터 인근 이은스퀘어 1층',phone:'070-7655-5044',detail_url:'',sort_order:1},
    {num:'43',region:'chungcheong',name:'우동키노야 충주호암점',address:'충북 충주시 호암수청2로 10 1층 115호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 충주 호암지구 신도시 상업지구 1층 위치',phone:'070-7797-7286',detail_url:'',sort_order:1},
    {num:'52',region:'chungcheong',name:'우동키노야 충남대점',address:'대전 유성구 유성대로 875, BS타워 1층 110호, 111호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 일요일 정기휴무',meta:'🍜 유성구 충남대학교 인근 BS타워 1층',phone:'042-825-5808',detail_url:'',sort_order:2},
    {num:'38',region:'daegu',name:'우동키노야 대구죽전점',address:'대구 달서구 달구벌대로 1551 1층 104호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 죽전역 1번 출구 골든타워 1층, 대구 첫 가맹 매장',phone:'070-8666-7141',detail_url:'',sort_order:1},
    {num:'19',region:'busan',name:'우동키노야 부산서면점',address:'부산 부산진구 서면로 69-1 1층',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 연중무휴',meta:'🍜 서면역 1번/7번 출구 인근 메인로드 위치, 부산 1호점',phone:'051-710-5799',detail_url:'seomyeon/',sort_order:1},
    {num:'34',region:'busan',name:'우동키노야 부산광안점',address:'부산 수영구 광남로 75 2층',hours_combined:'🕒 11:00 ~ 21:30 (BT 15:30~17:00, LO 21:00) · 연중무휴',meta:'🍜 광안리 해수욕장 도보 3분 거리 2층, 오션뷰 산책 코스 연계',phone:'070-7755-1267',detail_url:'',sort_order:2},
    {num:'41',region:'busan',name:'우동키노야 BIFC2 스퀘어가든점',address:'부산 남구 남동천로 128, BIFC2 2층 241호',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 일요일 정기휴무',meta:'🍜 국제금융센터.부산은행역 3번 출구에서 471m',phone:'070-7786-1649',detail_url:'',sort_order:3},
    {num:'44',region:'jeju',name:'우동키노야 제주노형점',address:'제주 제주시 과원북4길 29 1층',hours_combined:'🕒 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30) · 매주 수요일 정기휴무',meta:'🍜 제주 노형동 중심가 위치, 제주 1호점',phone:'0507-1376-7008',detail_url:'',sort_order:1}
  ];

  function buildBuiltinBaseStores() {
    return BUILTIN_BASE_STORES.map(item => {
      const q = encodeURIComponent(item.name || '우동키노야');
      const hc = splitHoursClosed(item.hours_combined || '');
      return {
        code: 'store.' + item.num,
        num: item.num,
        region: item.region,
        name: item.name,
        address: item.address,
        hours_combined: item.hours_combined || '',
        hours: hc.hours,
        closed_days: hc.closed_days,
        meta: item.meta || '',
        phone: item.phone || '',
        photo: item.photo || '',
        naver_map_url: item.naver_map_url || ('https://map.naver.com/p/search/' + q),
        google_map_url: item.google_map_url || ('https://www.google.com/maps/search/' + q),
        kakao_map_url: 'https://map.kakao.com/link/search/' + q,
        tmap_url: 'https://tmap.life/search?query=' + q,
        detail_url: item.detail_url || '',
        sort_order: item.sort_order || 1,
        is_published: true
      };
    });
  }

  async function loadBaseStoresFromHtml() {
    try {
      const url = new URL('../store/index.html', A.root).href;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return buildBuiltinBaseStores();
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const stores = [];
      const regions = ['seoul', 'gyeonggi', 'incheon', 'chungcheong', 'daegu', 'busan', 'jeju'];
      regions.forEach(region => {
        const sec = doc.getElementById(region);
        if (!sec) return;
        sec.querySelectorAll('.store-card[id^="store-"]').forEach((card, idx) => {
          const m = card.id.match(/^store-(\d+)$/);
          if (!m) return;
          const num = m[1];
          const nameEl = card.querySelector('[data-cms="store.' + num + '.name"]') || card.querySelector('h3');
          const addrEl = card.querySelector('[data-cms="store.' + num + '.addr"]') || card.querySelector('address');
          const hoursEl = card.querySelector('[data-cms="store.' + num + '.hours"]');
          const metaEl = card.querySelector('[data-cms="store.' + num + '.meta"]') || card.querySelector('.store-meta span:last-child');
          const telEl = card.querySelector('.store-actions a[href^="tel:"]');
          const detailEl = Array.from(card.querySelectorAll('.store-actions a')).find(a => !a.href.startsWith('tel:') && !/google\.com|naver\.com|naver\.me|kakao\.com|tmap\.life/i.test(a.getAttribute('href') || ''));
          const googleEl = Array.from(card.querySelectorAll('.store-actions a')).find(a => /google\.com\/maps/i.test(a.getAttribute('href') || ''));
          const naverEl = Array.from(card.querySelectorAll('.store-actions a')).find(a => /naver\.com|naver\.me/i.test(a.getAttribute('href') || ''));
          const imgEl = card.querySelector('.store-thumb img');
          const labelName = (nameEl ? nameEl.textContent : '').replace(/\s*→\s*$/, '').trim();
          const q = encodeURIComponent(labelName || '우동키노야');
          const hc = splitHoursClosed(hoursEl ? hoursEl.textContent : '');
          stores.push({
            code: 'store.' + num,
            num: num,
            region: region,
            name: labelName,
            address: (addrEl ? addrEl.textContent : '').trim(),
            hours_combined: (hoursEl ? hoursEl.textContent : '').trim(),
            hours: hc.hours,
            closed_days: hc.closed_days,
            meta: (metaEl ? metaEl.textContent : '').trim(),
            phone: telEl ? (telEl.getAttribute('href') || '').replace(/^tel:/i, '').trim() : '',
            photo: imgEl ? (imgEl.getAttribute('src') || '').replace(/^\.\.\//, '') : '',
            naver_map_url: naverEl ? (naverEl.getAttribute('href') || '').trim() : '',
            google_map_url: googleEl ? (googleEl.getAttribute('href') || '').trim() : '',
            kakao_map_url: 'https://map.kakao.com/link/search/' + q,
            tmap_url: 'https://tmap.life/search?query=' + q,
            detail_url: detailEl ? (detailEl.getAttribute('href') || '').trim() : '',
            sort_order: idx + 1,
            is_published: true
          });
        });
      });
      return stores.length ? stores : buildBuiltinBaseStores();
    } catch (e) {
      return buildBuiltinBaseStores();
    }
  }

  function toSheetRow(item) {
    return {
      '매장코드': item.code || item.id || '',
      '지역': REGION_LABELS[item.region] || (item.region === 'seoul' ? '서울지역' : '경기'),
      '매장명': item.name || '',
      '주소': item.address || '',
      '영업시간': item.hours || '',
      '휴무일': item.closed_days || '',
      '한줄소개': item.meta || '',
      '전화번호': item.phone || '',
      '사진경로': item.photo || '',
      '네이버맵링크': item.naver_map_url || '',
      '구글맵링크': item.google_map_url || '',
      '카카오맵링크': item.kakao_map_url || '',
      '티맵링크': item.tmap_url || '',
      '상세페이지링크': item.detail_url || '',
      '표시순서': Number.isFinite(Number(item.sort_order)) ? Number(item.sort_order) : 0,
      '공개여부': item.is_published === false ? 'FALSE' : 'TRUE'
    };
  }

  function parseWorkbookRows(wb) {
    const sheetDefs = [
      { names: ['서울지역', '서울 지역', '서울'], defaultRegion: 'seoul' },
      { names: ['전국 각지', '전국각지', '전국'], defaultRegion: 'gyeonggi' },
      { names: ['전국_우동키노야_매장안내'], defaultRegion: 'auto' }
    ];
    const parsedRows = [];
    const matchedSheets = new Set();
    sheetDefs.forEach(def => {
      const foundName = wb.SheetNames.find(n => def.names.includes(n.trim()));
      if (!foundName) return;
      matchedSheets.add(foundName);
      const sheet = wb.Sheets[foundName];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      rows.forEach((raw, idx) => {
        const name = String(raw['매장명'] || raw['name'] || '').trim();
        const address = String(raw['주소'] || raw['도로명 주소'] || raw['address'] || '').trim();
        if (!name && !address) return;
        if (!name || !address) throw new Error('[' + foundName + ' 시트 ' + (idx + 2) + '행] 매장명과 주소는 모두 필수입니다.');
        const rawRegion = String(raw['지역'] || raw['region'] || '').trim();
        const region = def.defaultRegion === 'seoul'
          ? 'seoul'
          : (LABEL_TO_REGION[rawRegion] || (def.defaultRegion === 'auto' ? 'seoul' : 'gyeonggi'));
        const code = String(raw['매장코드'] || raw['id'] || '').trim();
        const hours = String(raw['영업시간'] || raw['hours'] || '').trim();
        const closed_days = String(raw['휴무일'] || raw['closed_days'] || '').trim();
        const meta = String(raw['한줄소개'] || raw['특이사항 및 특징'] || raw['meta'] || '').trim();
        const phone = String(raw['전화번호'] || raw['phone'] || '').trim();
        const photo = String(raw['사진경로'] || raw['photo'] || '').trim();
        const naver_map_url = String(raw['네이버맵링크'] || raw['naver_map_url'] || '').trim();
        const google_map_url = String(raw['구글맵링크'] || raw['google_map_url'] || '').trim();
        const kakao_map_url = String(raw['카카오맵링크'] || raw['kakao_map_url'] || '').trim();
        const tmap_url = String(raw['티맵링크'] || raw['tmap_url'] || '').trim();
        const detail_url = String(raw['상세페이지링크'] || raw['detail_url'] || '').trim();
        const sort_order = Number.isFinite(Number(raw['표시순서'])) && String(raw['표시순서']).trim() !== '' ? Number(raw['표시순서']) : (idx + 1);
        const pubRaw = String(raw['공개여부'] ?? 'TRUE').trim().toUpperCase();
        const is_published = !['FALSE', '0', 'N', 'NO', '비공개'].includes(pubRaw);
        if (photo) A.safeURL(photo, true);
        [naver_map_url, google_map_url, kakao_map_url, tmap_url, detail_url].forEach(u => { if (u) A.safeURL(u); });
        A.assertNoBinary({ photo, naver_map_url, google_map_url, kakao_map_url, tmap_url, detail_url });
        parsedRows.push({ sheetName: foundName, code, region, name, address, hours, closed_days, meta, phone, photo, naver_map_url, google_map_url, kakao_map_url, tmap_url, detail_url, sort_order, is_published });
      });
    });
    return parsedRows;
  }

  async function loadStoreCmsRowsSafe() {
    const editorApi = window.KinoyaAdminEditor;
    if (editorApi && typeof editorApi.isReady === 'function' && editorApi.isReady() && typeof editorApi.getRowsByPrefix === 'function') {
      return editorApi.getRowsByPrefix('store.');
    }
    try {
      const cached = JSON.parse(localStorage.getItem('cms_cache') || '{}');
      if (cached && Array.isArray(cached.data) && cached.data.length) {
        return cached.data.filter(r => r && typeof r.key === 'string' && r.key.indexOf('store.') === 0);
      }
    } catch (e) {}
    try {
      return await A.all('site_content', { search: 'store.' });
    } catch (err) {
      if (editorApi && typeof editorApi.getRowsByPrefix === 'function') {
        const fallback = editorApi.getRowsByPrefix('store.');
        if (fallback.length) return fallback;
      }
      try {
        const allRows = await A.all('site_content');
        return (allRows || []).filter(r => r && typeof r.key === 'string' && r.key.indexOf('store.') === 0);
      } catch (err2) {
        console.warn('[store-excel] site_content 조회 폴백(HTML 기본 매장 데이터 사용):', err2);
        return [];
      }
    }
  }

  async function loadCustomStoresSafe() {
    try {
      return await A.all('store_items');
    } catch (err) {
      console.warn('[store-excel] store_items 조회 경고(기본 매장 데이터만 진행):', err);
      return [];
    }
  }

  async function getMergedAllStores() {
    const [baseStores, cmsRows, customStores] = await Promise.all([
      loadBaseStoresFromHtml(),
      loadStoreCmsRowsSafe(),
      loadCustomStoresSafe()
    ]);
    const cmsMap = Object.create(null);
    cmsRows.forEach(r => { if (r && r.key) cmsMap[r.key] = r.value; });

    const mergedBase = baseStores.map(s => {
      const prefix = 'store.' + s.num + '.';
      const savedHoursRaw = cmsMap[prefix + 'hours'] != null && cmsMap[prefix + 'hours'] !== '' ? cmsMap[prefix + 'hours'] : s.hours_combined;
      const hc = splitHoursClosed(savedHoursRaw);
      return {
        code: 'store.' + s.num,
        num: s.num,
        isBase: true,
        region: s.region,
        name: cmsMap[prefix + 'name'] != null && cmsMap[prefix + 'name'] !== '' ? cmsMap[prefix + 'name'] : s.name,
        address: cmsMap[prefix + 'addr'] != null && cmsMap[prefix + 'addr'] !== '' ? cmsMap[prefix + 'addr'] : s.address,
        hours: hc.hours,
        closed_days: hc.closed_days,
        hours_combined: savedHoursRaw,
        meta: cmsMap[prefix + 'meta'] != null && cmsMap[prefix + 'meta'] !== '' ? cmsMap[prefix + 'meta'] : s.meta,
        phone: cmsMap[prefix + 'phone'] != null && cmsMap[prefix + 'phone'] !== '' ? cmsMap[prefix + 'phone'] : s.phone,
        photo: cmsMap[prefix + 'photo'] != null ? cmsMap[prefix + 'photo'] : s.photo,
        naver_map_url: cmsMap[prefix + 'naver_map_url'] != null && cmsMap[prefix + 'naver_map_url'] !== '' ? cmsMap[prefix + 'naver_map_url'] : s.naver_map_url,
        google_map_url: cmsMap[prefix + 'google_map_url'] != null && cmsMap[prefix + 'google_map_url'] !== '' ? cmsMap[prefix + 'google_map_url'] : s.google_map_url,
        kakao_map_url: cmsMap[prefix + 'kakao_map_url'] != null && cmsMap[prefix + 'kakao_map_url'] !== '' ? cmsMap[prefix + 'kakao_map_url'] : s.kakao_map_url,
        tmap_url: cmsMap[prefix + 'tmap_url'] != null && cmsMap[prefix + 'tmap_url'] !== '' ? cmsMap[prefix + 'tmap_url'] : s.tmap_url,
        detail_url: cmsMap[prefix + 'detail_url'] != null && cmsMap[prefix + 'detail_url'] !== '' ? cmsMap[prefix + 'detail_url'] : s.detail_url,
        sort_order: s.sort_order,
        is_published: true,
        baseDefaults: s
      };
    });

    const sortedCustom = (customStores || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    const allStores = [
      ...mergedBase,
      ...sortedCustom.map(c => ({
        code: c.id,
        id: c.id,
        isBase: false,
        region: c.region || 'seoul',
        name: c.name || '',
        address: c.address || '',
        hours: c.hours || '',
        closed_days: c.closed_days || '',
        meta: c.meta || '',
        phone: c.phone || '',
        photo: c.photo || '',
        naver_map_url: c.naver_map_url || '',
        google_map_url: c.google_map_url || '',
        kakao_map_url: c.kakao_map_url || '',
        tmap_url: c.tmap_url || '',
        detail_url: c.detail_url || '',
        sort_order: c.sort_order || 0,
        is_published: c.is_published !== false
      }))
    ];
    return { baseStores, cmsRows, customStores, mergedBase, allStores };
  }

  async function saveBaseStoreData(storeNum, formValues, baseDefault) {
    const cmsRows = await loadStoreCmsRowsSafe();
    const cmsByKey = new Map(cmsRows.filter(r => r && r.key).map(r => [r.key, r]));
    const combinedHours = (formValues.hours || formValues.closed_days)
      ? joinHoursClosed(formValues.hours, formValues.closed_days)
      : (baseDefault ? baseDefault.hours_combined : '');
    const fieldsToSync = [
      { suffix: 'name', val: formValues.name, def: baseDefault?.name || '', type: 'text', label: '매장' + storeNum + ' 매장명' },
      { suffix: 'addr', val: formValues.address, def: baseDefault?.address || '', type: 'text', label: '매장' + storeNum + ' 주소' },
      { suffix: 'hours', val: combinedHours, def: baseDefault?.hours_combined || '', type: 'text', label: '매장' + storeNum + ' 영업시간·휴무일' },
      { suffix: 'meta', val: formValues.meta, def: baseDefault?.meta || '', type: 'text', label: '매장' + storeNum + ' 한줄소개' },
      { suffix: 'phone', val: formValues.phone, def: baseDefault?.phone || '', type: 'text', label: '매장' + storeNum + ' 전화번호' },
      { suffix: 'naver_map_url', val: formValues.naver_map_url, def: baseDefault?.naver_map_url || '', type: 'text', label: '매장' + storeNum + ' 네이버맵링크' },
      { suffix: 'google_map_url', val: formValues.google_map_url, def: baseDefault?.google_map_url || '', type: 'text', label: '매장' + storeNum + ' 구글맵링크' },
      { suffix: 'kakao_map_url', val: formValues.kakao_map_url, def: baseDefault?.kakao_map_url || '', type: 'text', label: '매장' + storeNum + ' 카카오맵링크' },
      { suffix: 'tmap_url', val: formValues.tmap_url, def: baseDefault?.tmap_url || '', type: 'text', label: '매장' + storeNum + ' 티맵링크' },
      { suffix: 'detail_url', val: formValues.detail_url, def: baseDefault?.detail_url || '', type: 'text', label: '매장' + storeNum + ' 상세페이지링크' }
    ];
    [formValues.naver_map_url, formValues.google_map_url, formValues.kakao_map_url, formValues.tmap_url, formValues.detail_url].forEach(u => {
      if (u) A.safeURL(u);
    });
    let savedCount = 0;
    for (const f of fieldsToSync) {
      const key = 'store.' + storeNum + '.' + f.suffix;
      const existingRow = cmsByKey.get(key);
      const curVal = existingRow ? String(existingRow.value ?? '') : String(f.def ?? '');
      if (String(f.val ?? '') !== curVal || existingRow) {
        const url = '/tables/site_content' + (existingRow && existingRow.id ? '/' + encodeURIComponent(existingRow.id) : '');
        const res = await A.fetch(url, {
          method: existingRow && existingRow.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: key, page: '매장 찾기 - 개별 매장', label: f.label, type: f.type, value: String(f.val ?? '') })
        });
        const saved = await res.json();
        cmsByKey.set(key, saved);
        if (window.KinoyaAdminEditor && typeof window.KinoyaAdminEditor.setRow === 'function') {
          window.KinoyaAdminEditor.setRow(key, saved);
        }
        const domInput = document.getElementById('text-store-' + storeNum + '-' + f.suffix.replace(/[^a-zA-Z0-9]/g, '-'));
        if (domInput) {
          domInput.value = String(f.val ?? '');
          delete domInput.dataset.dirty;
        }
        savedCount++;
      }
    }
    try { localStorage.removeItem('cms_cache'); } catch (e) {}
    return savedCount;
  }

  function fillNewStoreForm(section, rowData) {
    const newForm = section.querySelector('form.collection-card:not([data-id])');
    if (!newForm) return false;
    const setVal = (name, val) => {
      const el = newForm.querySelector('[name="' + name + '"]');
      if (!el) return;
      if (el.type === 'checkbox') el.checked = val !== false && String(val).toUpperCase() !== 'FALSE';
      else el.value = val != null ? String(val) : '';
    };
    setVal('name', rowData.name || '');
    setVal('region', rowData.region || 'seoul');
    setVal('address', rowData.address || '');
    setVal('hours', rowData.hours || '');
    setVal('closed_days', rowData.closed_days || '');
    setVal('meta', rowData.meta || '');
    setVal('phone', rowData.phone || '');
    setVal('naver_map_url', rowData.naver_map_url || '');
    setVal('google_map_url', rowData.google_map_url || '');
    setVal('kakao_map_url', rowData.kakao_map_url || '');
    setVal('tmap_url', rowData.tmap_url || '');
    setVal('detail_url', rowData.detail_url || '');
    setVal('sort_order', rowData.sort_order != null ? rowData.sort_order : 0);
    setVal('is_published', rowData.is_published !== false);
    newForm.dataset.dirty = '1';
    newForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return true;
  }

  function mountExcelToolbarAndReferenceEditor(section) {
    const bar = document.createElement('div');
    bar.id = 'store-excel-toolbar';
    bar.className = 'mb-5 space-y-4';
    bar.innerHTML =
      '<div class="flex flex-wrap items-center justify-between gap-3">' +
        '<div>' +
          '<h3 class="text-sm font-bold text-slate-800">📊 매장 관리 엑셀 참조 데이터 입력 · 다운로드 · 일괄 업로드 (시트: "서울지역" / "전국 각지")</h3>' +
          '<p class="text-xs text-slate-500 mt-1">첨부하신 엑셀 양식(<b>매장코드 · 지역 · 매장명 · 주소 · 영업시간 · 휴무일 · 한줄소개 · 전화번호 · 네이버맵 · 구글맵 · 카카오맵 · 티맵 · 상세페이지링크 · 표시순서 · 공개여부</b>)의 사진 외 모든 데이터를 여기서 직접 입력·수정하거나, 엑셀 파일을 참조로 불러와 원하는 행을 폼에 자동 채우기 / 일괄 반영할 수 있습니다.</p>' +
        '</div>' +
        '<div class="flex flex-wrap items-center gap-2">' +
          '<button type="button" id="store-excel-download-btn" class="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg transition"><i class="fa-solid fa-file-excel mr-1.5"></i>매장 엑셀 다운로드 (2개 시트)</button>' +
          '<label for="store-excel-ref-input" class="cursor-pointer bg-amber-700 hover:bg-amber-800 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg transition"><i class="fa-solid fa-table-list mr-1.5"></i>엑셀 파일 참조 불러오기 (행 선택 입력)</label>' +
          '<input type="file" id="store-excel-ref-input" accept=".xlsx,.xls" class="sr-only">' +
          '<label for="store-excel-upload-input" class="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-lg transition"><i class="fa-solid fa-file-import mr-1.5"></i>매장 엑셀 전체 일괄 반영</label>' +
          '<input type="file" id="store-excel-upload-input" accept=".xlsx,.xls" class="sr-only">' +
        '</div>' +
      '</div>' +
      '<div id="store-excel-status" role="status" aria-live="polite" class="text-xs text-slate-600"></div>' +
      '<div id="store-excel-ref-preview" class="hidden bg-white border border-amber-200 rounded-lg p-3 space-y-2">' +
        '<div class="flex flex-wrap items-center justify-between gap-2">' +
          '<div class="text-xs font-bold text-amber-900"><i class="fa-solid fa-folder-open mr-1"></i>불러온 엑셀 참조 목록 — 행을 선택해 [새 매장 등록 폼에 채우기] 또는 [해당 매장 데이터 즉시 저장]을 누르세요</div>' +
          '<button type="button" id="store-excel-ref-close" class="text-xs text-slate-500 hover:text-slate-800 px-2 py-1">닫기 ✕</button>' +
        '</div>' +
        '<div class="max-h-64 overflow-auto border border-slate-100 rounded">' +
          '<table class="w-full text-xs text-left">' +
            '<thead class="bg-slate-100 text-slate-600 sticky top-0">' +
              '<tr><th class="p-2">시트/지역</th><th class="p-2">매장코드</th><th class="p-2">매장명</th><th class="p-2">주소</th><th class="p-2">영업시간 / 휴무일</th><th class="p-2">전화번호</th><th class="p-2">작업</th></tr>' +
            '</thead>' +
            '<tbody id="store-excel-ref-tbody"></tbody>' +
          '</table>' +
        '</div>' +
      '</div>' +
      '<div class="bg-white border border-slate-200 rounded-lg p-4">' +
        '<div class="flex flex-wrap items-center justify-between gap-2 mb-3">' +
          '<div>' +
            '<h4 class="text-sm font-bold text-slate-800">✏️ 기존 51개 매장(서울지역 26개 · 전국 각지 25개) 사진 외 전체 데이터(엑셀 항목) 빠른 편집기</h4>' +
            '<p class="text-xs text-slate-500">매장을 선택하면 현재 저장된 매장명·주소·영업시간·휴무일·한줄소개·전화번호·4대 지도 링크·상세페이지 링크가 엑셀 컬럼 그대로 불러와집니다. 수정 후 <b>[💾 이 매장 데이터 즉시 저장]</b>을 누르면 바로 적용됩니다.</p>' +
          '</div>' +
          '<div class="flex items-center gap-2">' +
            '<select id="store-quick-region-filter" class="border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium">' +
              '<option value="all">전체 권역 (51개 매장)</option>' +
              '<option value="seoul">서울지역 (26개 매장)</option>' +
              '<option value="nation">전국 각지 (25개 매장)</option>' +
            '</select>' +
            '<select id="store-quick-select" class="border border-slate-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 min-w-[220px]"></select>' +
          '</div>' +
        '</div>' +
        '<div id="store-quick-form" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">' +
          '<label class="block"><span class="font-semibold text-slate-700">매장코드 / 지역</span><input type="text" id="sq-code-region" readonly class="mt-1 w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-600 font-mono"></label>' +
          '<label class="block"><span class="font-semibold text-slate-700">매장명 *</span><input type="text" id="sq-name" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block"><span class="font-semibold text-slate-700">전화번호</span><input type="text" id="sq-phone" placeholder="예: 0507-1408-1984" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block sm:col-span-2 lg:col-span-3"><span class="font-semibold text-slate-700">도로명/지번 주소 *</span><input type="text" id="sq-address" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block"><span class="font-semibold text-slate-700">영업시간 (엑셀 "영업시간" 열)</span><input type="text" id="sq-hours" placeholder="예: 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30)" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block"><span class="font-semibold text-slate-700">휴무일 (엑셀 "휴무일" 열)</span><input type="text" id="sq-closed" placeholder="예: 연중무휴 / 매주 월요일 정기휴무" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block"><span class="font-semibold text-slate-700">상세페이지 링크 (엑셀 "상세페이지링크" 열)</span><input type="text" id="sq-detail" placeholder="예: yongsan/ 또는 guri/" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block sm:col-span-2 lg:col-span-3"><span class="font-semibold text-slate-700">한줄소개·특징 (엑셀 "한줄소개" 열)</span><input type="text" id="sq-meta" placeholder="예: 🍜 직영점, 신용산역/용산역 인근, 장어튀김붓카케 및 토리텐 인기" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block"><span class="font-semibold text-slate-700">네이버맵 링크 (엑셀 "네이버맵링크" 열)</span><input type="text" id="sq-naver" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block"><span class="font-semibold text-slate-700">구글맵 링크 (엑셀 "구글맵링크" 열)</span><input type="text" id="sq-google" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block"><span class="font-semibold text-slate-700">카카오맵 링크 (엑셀 "카카오맵링크" 열)</span><input type="text" id="sq-kakao" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<label class="block sm:col-span-2"><span class="font-semibold text-slate-700">티맵 링크 (엑셀 "티맵링크" 열)</span><input type="text" id="sq-tmap" class="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"></label>' +
          '<div class="flex items-end gap-2">' +
            '<button type="button" id="sq-save-btn" class="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-lg transition"><i class="fa-solid fa-floppy-disk mr-1.5"></i>이 매장 데이터 즉시 저장</button>' +
          '</div>' +
        '</div>' +
        '<div id="sq-status" role="status" aria-live="polite" class="text-xs mt-2"></div>' +
      '</div>';

    const heading = section.querySelector('h2');
    if (heading && heading.nextSibling) section.insertBefore(bar, heading.nextSibling);
    else section.prepend(bar);

    const dlBtn = bar.querySelector('#store-excel-download-btn');
    const refInput = bar.querySelector('#store-excel-ref-input');
    const ulInput = bar.querySelector('#store-excel-upload-input');
    const statusEl = bar.querySelector('#store-excel-status');
    const refPreview = bar.querySelector('#store-excel-ref-preview');
    const refTbody = bar.querySelector('#store-excel-ref-tbody');
    const refClose = bar.querySelector('#store-excel-ref-close');
    const regionFilter = bar.querySelector('#store-quick-region-filter');
    const storeSelect = bar.querySelector('#store-quick-select');
    const sqSaveBtn = bar.querySelector('#sq-save-btn');
    const sqStatus = bar.querySelector('#sq-status');
    let busy = false;
    let cachedMergedBase = [];

    function setStatus(msg, isError) {
      statusEl.textContent = msg;
      statusEl.className = 'text-xs mt-1 ' + (isError ? 'text-red-700 font-semibold' : 'text-emerald-800 font-medium');
    }

    function setQuickStatus(msg, isError) {
      sqStatus.textContent = msg;
      sqStatus.className = 'text-xs mt-2 ' + (isError ? 'text-red-700 font-semibold' : 'text-emerald-800 font-semibold');
    }

    function populateQuickEditorFields(storeObj) {
      if (!storeObj) return;
      bar.querySelector('#sq-code-region').value = storeObj.code + ' · ' + (REGION_LABELS[storeObj.region] || storeObj.region);
      bar.querySelector('#sq-name').value = storeObj.name || '';
      bar.querySelector('#sq-phone').value = storeObj.phone || '';
      bar.querySelector('#sq-address').value = storeObj.address || '';
      bar.querySelector('#sq-hours').value = storeObj.hours || '';
      bar.querySelector('#sq-closed').value = storeObj.closed_days || '';
      bar.querySelector('#sq-detail').value = storeObj.detail_url || '';
      bar.querySelector('#sq-meta').value = storeObj.meta || '';
      bar.querySelector('#sq-naver').value = storeObj.naver_map_url || '';
      bar.querySelector('#sq-google').value = storeObj.google_map_url || '';
      bar.querySelector('#sq-kakao').value = storeObj.kakao_map_url || '';
      bar.querySelector('#sq-tmap').value = storeObj.tmap_url || '';
    }

    async function refreshQuickEditorList(keepCode) {
      const { mergedBase } = await getMergedAllStores();
      cachedMergedBase = mergedBase;
      const filterVal = regionFilter.value;
      const filtered = mergedBase.filter(s => {
        if (filterVal === 'seoul') return s.region === 'seoul';
        if (filterVal === 'nation') return s.region !== 'seoul';
        return true;
      });
      storeSelect.innerHTML = filtered.map(s =>
        '<option value="' + escapeHtml(s.code) + '">[' + escapeHtml(REGION_LABELS[s.region] || s.region) + '] ' + escapeHtml(s.name) + ' (' + escapeHtml(s.code) + ')</option>'
      ).join('');
      if (keepCode && filtered.some(s => s.code === keepCode)) {
        storeSelect.value = keepCode;
      }
      const current = filtered.find(s => s.code === storeSelect.value) || filtered[0];
      if (current) populateQuickEditorFields(current);
    }

    regionFilter.addEventListener('change', function () {
      refreshQuickEditorList();
    });

    storeSelect.addEventListener('change', function () {
      const found = cachedMergedBase.find(s => s.code === storeSelect.value);
      if (found) {
        populateQuickEditorFields(found);
        setQuickStatus('');
      }
    });

    sqSaveBtn.addEventListener('click', async function () {
      if (busy) return;
      const current = cachedMergedBase.find(s => s.code === storeSelect.value);
      if (!current) return;
      const formValues = {
        name: bar.querySelector('#sq-name').value.trim(),
        phone: bar.querySelector('#sq-phone').value.trim(),
        address: bar.querySelector('#sq-address').value.trim(),
        hours: bar.querySelector('#sq-hours').value.trim(),
        closed_days: bar.querySelector('#sq-closed').value.trim(),
        detail_url: bar.querySelector('#sq-detail').value.trim(),
        meta: bar.querySelector('#sq-meta').value.trim(),
        naver_map_url: bar.querySelector('#sq-naver').value.trim(),
        google_map_url: bar.querySelector('#sq-google').value.trim(),
        kakao_map_url: bar.querySelector('#sq-kakao').value.trim(),
        tmap_url: bar.querySelector('#sq-tmap').value.trim()
      };
      if (!formValues.name || !formValues.address) {
        setQuickStatus('❌ 매장명과 주소는 필수 입력 항목입니다.', true);
        return;
      }
      busy = true; sqSaveBtn.disabled = true;
      setQuickStatus('저장 중…');
      try {
        await saveBaseStoreData(current.num, formValues, current.baseDefaults);
        await refreshQuickEditorList(current.code);
        setQuickStatus('✅ [' + formValues.name + '] 사진 외 전체 데이터(영업시간·휴무일·한줄소개·전화번호·4대 지도 링크)가 즉시 저장되었습니다.');
      } catch (err) {
        setQuickStatus('❌ 저장 실패: ' + (err && err.message ? err.message : String(err)), true);
      } finally {
        busy = false; sqSaveBtn.disabled = false;
      }
    });

    refClose.addEventListener('click', function () {
      refPreview.classList.add('hidden');
    });

    refInput.addEventListener('change', async function () {
      const file = refInput.files && refInput.files[0];
      if (!file) return;
      if (!window.XLSX) { setStatus('엑셀 라이브러리(XLSX)를 불러오지 못했습니다.', true); return; }
      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const parsedRows = parseWorkbookRows(wb);
        if (!parsedRows.length) {
          setStatus('엑셀 파일에서 매장 행을 찾지 못했습니다. "서울지역" 또는 "전국 각지" 시트를 확인해주세요.', true);
          return;
        }
        refTbody.innerHTML = parsedRows.map((r, i) =>
          '<tr class="border-t border-slate-100 hover:bg-amber-50/40">' +
            '<td class="p-2 whitespace-nowrap font-medium text-slate-700">' + escapeHtml(REGION_LABELS[r.region] || r.region) + '</td>' +
            '<td class="p-2 whitespace-nowrap font-mono text-slate-500">' + escapeHtml(r.code || '(신규)') + '</td>' +
            '<td class="p-2 font-bold text-slate-800">' + escapeHtml(r.name) + '</td>' +
            '<td class="p-2 text-slate-600">' + escapeHtml(r.address) + '</td>' +
            '<td class="p-2 text-slate-600">' + escapeHtml(r.hours) + (r.closed_days ? ' · ' + escapeHtml(r.closed_days) : '') + '</td>' +
            '<td class="p-2 whitespace-nowrap text-slate-600">' + escapeHtml(r.phone) + '</td>' +
            '<td class="p-2 whitespace-nowrap space-x-1">' +
              (/^store\.\d+$/.test(r.code)
                ? '<button type="button" data-ref-edit="' + i + '" class="bg-slate-800 hover:bg-slate-900 text-white px-2.5 py-1 rounded text-xs font-semibold">편집기에 채우기</button>' +
                  '<button type="button" data-ref-save="' + i + '" class="bg-emerald-700 hover:bg-emerald-800 text-white px-2.5 py-1 rounded text-xs font-semibold">즉시 저장</button>'
                : '') +
              '<button type="button" data-ref-new="' + i + '" class="bg-amber-700 hover:bg-amber-800 text-white px-2.5 py-1 rounded text-xs font-semibold">새 매장 등록폼에 채우기</button>' +
            '</td>' +
          '</tr>'
        ).join('');
        refPreview.classList.remove('hidden');
        setStatus('✅ 엑셀 파일(' + file.name + ')에서 총 ' + parsedRows.length + '개 매장 데이터를 참조로 불러왔습니다. 원하는 행의 버튼을 눌러 입력하거나 저장하세요.');

        refTbody.querySelectorAll('[data-ref-edit]').forEach(btn => {
          btn.onclick = () => {
            const r = parsedRows[Number(btn.dataset.refEdit)];
            if (!r) return;
            regionFilter.value = 'all';
            refreshQuickEditorList(r.code).then(() => {
              populateQuickEditorFields(r);
              setQuickStatus('📋 엑셀에서 [' + r.name + '] 데이터를 불러왔습니다. 확인 후 [이 매장 데이터 즉시 저장]을 누르세요.');
              bar.querySelector('#store-quick-form').scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
          };
        });

        refTbody.querySelectorAll('[data-ref-save]').forEach(btn => {
          btn.onclick = async () => {
            const r = parsedRows[Number(btn.dataset.refSave)];
            if (!r || !/^store\.(\d+)$/.test(r.code)) return;
            const num = r.code.split('.')[1];
            const foundBase = cachedMergedBase.find(s => s.code === r.code);
            btn.disabled = true;
            btn.textContent = '저장중...';
            try {
              await saveBaseStoreData(num, r, foundBase ? foundBase.baseDefaults : null);
              await refreshQuickEditorList(r.code);
              btn.textContent = '✅ 저장됨';
              setStatus('✅ 엑셀 행 [' + r.name + '] 데이터가 즉시 저장되었습니다.');
            } catch (e) {
              btn.textContent = '실패';
              setStatus('❌ 저장 실패: ' + e.message, true);
            } finally {
              setTimeout(() => { btn.disabled = false; }, 600);
            }
          };
        });

        refTbody.querySelectorAll('[data-ref-new]').forEach(btn => {
          btn.onclick = () => {
            const r = parsedRows[Number(btn.dataset.refNew)];
            if (!r) return;
            if (fillNewStoreForm(section, r)) {
              setStatus('📋 아래 [새 항목 등록] 폼에 [' + r.name + ']의 사진 외 모든 엑셀 데이터를 채웠습니다. 확인 후 [등록]을 누르세요.');
            }
          };
        });
      } catch (err) {
        setStatus('엑셀 참조 읽기 실패: ' + (err && err.message ? err.message : String(err)), true);
      } finally {
        refInput.value = '';
      }
    });

    dlBtn.addEventListener('click', async function () {
      if (busy) return;
      if (!window.XLSX) { setStatus('엑셀 라이브러리(XLSX)를 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.', true); return; }
      busy = true; dlBtn.disabled = true; ulInput.disabled = true;
      setStatus('서울지역 · 전국 각지 매장 데이터를 정리하여 엑셀 파일을 생성하는 중입니다...');
      try {
        const { allStores } = await getMergedAllStores();
        const seoulRows = allStores.filter(s => s.region === 'seoul').map(toSheetRow);
        const nationRows = allStores.filter(s => s.region !== 'seoul').map(toSheetRow);

        const wb = XLSX.utils.book_new();
        const wsSeoul = XLSX.utils.json_to_sheet(seoulRows, { header: EXCEL_HEADERS });
        const wsNation = XLSX.utils.json_to_sheet(nationRows, { header: EXCEL_HEADERS });
        const colWidths = [{wch:14},{wch:10},{wch:30},{wch:42},{wch:38},{wch:26},{wch:34},{wch:18},{wch:32},{wch:36},{wch:36},{wch:36},{wch:36},{wch:22},{wch:10},{wch:10}];
        wsSeoul['!cols'] = colWidths;
        wsNation['!cols'] = colWidths;
        XLSX.utils.book_append_sheet(wb, wsSeoul, '서울지역');
        XLSX.utils.book_append_sheet(wb, wsNation, '전국 각지');

        const dateStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, '우동키노야_매장관리_서울지역_전국각지_' + dateStr + '.xlsx');
        setStatus('다운로드 완료: "서울지역" 시트(' + seoulRows.length + '개 매장) + "전국 각지" 시트(' + nationRows.length + '개 매장) 총 ' + (seoulRows.length + nationRows.length) + '개 매장이 엑셀로 저장되었습니다.');
      } catch (err) {
        console.error('[store-excel] 다운로드 실패:', err);
        setStatus('엑셀 다운로드 실패: ' + (err && err.message ? err.message : String(err)), true);
      } finally {
        busy = false; dlBtn.disabled = false; ulInput.disabled = false;
      }
    });

    ulInput.addEventListener('change', async function () {
      const file = ulInput.files && ulInput.files[0];
      if (!file || busy) return;
      if (!window.XLSX) { setStatus('엑셀 라이브러리(XLSX)를 불러오지 못했습니다.', true); return; }
      busy = true; dlBtn.disabled = true; ulInput.disabled = true;
      setStatus('업로드한 엑셀 파일("서울지역", "전국 각지" 시트)을 읽고 검증하는 중입니다...');
      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: 'array' });
        const parsedRows = parseWorkbookRows(wb);

        if (!parsedRows.length) {
          throw new Error('"서울지역" 또는 "전국 각지" 시트에서 매장 데이터를 찾지 못했습니다. 다운로드한 엑셀 양식의 시트 이름("서울지역", "전국 각지")을 유지해주세요.');
        }

        const [baseStores, cmsRows, existingCustom] = await Promise.all([
          loadBaseStoresFromHtml(),
          loadStoreCmsRowsSafe(),
          loadCustomStoresSafe()
        ]);
        const baseByCode = new Map(baseStores.map(s => [s.code, s]));
        const cmsByKey = new Map(cmsRows.filter(r => r && r.key).map(r => [r.key, r]));
        const customById = new Map(existingCustom.map(r => [r.id, r]));

        let baseUpdated = 0, customCreated = 0, customUpdated = 0;

        for (const item of parsedRows) {
          if (/^store\.\d+$/.test(item.code) && baseByCode.has(item.code)) {
            const base = baseByCode.get(item.code);
            const num = base.num;
            const combinedHours = (item.hours || item.closed_days) ? joinHoursClosed(item.hours, item.closed_days) : base.hours_combined;
            const fieldsToSync = [
              { suffix: 'name', val: item.name, def: base.name, type: 'text', label: '매장' + num + ' 이름' },
              { suffix: 'addr', val: item.address, def: base.address, type: 'text', label: '매장' + num + ' 주소' },
              { suffix: 'hours', val: combinedHours, def: base.hours_combined, type: 'text', label: '매장' + num + ' 영업시간·휴무일' },
              { suffix: 'meta', val: item.meta, def: base.meta, type: 'text', label: '매장' + num + ' 한줄설명' },
              { suffix: 'phone', val: item.phone, def: base.phone, type: 'text', label: '매장' + num + ' 전화번호' },
              { suffix: 'photo', val: item.photo, def: base.photo, type: 'image', label: '매장' + num + ' 사진' },
              { suffix: 'naver_map_url', val: item.naver_map_url, def: base.naver_map_url, type: 'text', label: '매장' + num + ' 네이버맵링크' },
              { suffix: 'google_map_url', val: item.google_map_url, def: base.google_map_url, type: 'text', label: '매장' + num + ' 구글맵링크' },
              { suffix: 'kakao_map_url', val: item.kakao_map_url, def: base.kakao_map_url, type: 'text', label: '매장' + num + ' 카카오맵링크' },
              { suffix: 'tmap_url', val: item.tmap_url, def: base.tmap_url, type: 'text', label: '매장' + num + ' 티맵링크' },
              { suffix: 'detail_url', val: item.detail_url, def: base.detail_url, type: 'text', label: '매장' + num + ' 상세페이지링크' }
            ];
            let touched = false;
            for (const f of fieldsToSync) {
              const key = 'store.' + num + '.' + f.suffix;
              const existingRow = cmsByKey.get(key);
              const curVal = existingRow ? String(existingRow.value ?? '') : String(f.def ?? '');
              if (String(f.val ?? '') !== curVal) {
                const url = '/tables/site_content' + (existingRow && existingRow.id ? '/' + encodeURIComponent(existingRow.id) : '');
                const res = await A.fetch(url, {
                  method: existingRow && existingRow.id ? 'PUT' : 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ key: key, page: '매장 찾기 - 개별 매장', label: f.label, type: f.type, value: f.val })
                });
                const saved = await res.json();
                cmsByKey.set(key, saved);
                if (window.KinoyaAdminEditor && typeof window.KinoyaAdminEditor.setRow === 'function') {
                  window.KinoyaAdminEditor.setRow(key, saved);
                }
                touched = true;
              }
            }
            if (touched) baseUpdated++;
          } else {
            const payload = {
              name: item.name,
              region: item.region,
              address: item.address,
              hours: item.hours,
              closed_days: item.closed_days,
              meta: item.meta,
              phone: item.phone,
              photo: item.photo,
              naver_map_url: item.naver_map_url,
              google_map_url: item.google_map_url,
              kakao_map_url: item.kakao_map_url,
              tmap_url: item.tmap_url,
              detail_url: item.detail_url,
              sort_order: item.sort_order,
              is_published: item.is_published
            };
            const existing = item.code ? customById.get(item.code) : null;
            if (existing) {
              const diff = Object.keys(payload).some(k => String(payload[k] ?? '') !== String(existing[k] ?? ''));
              if (diff) {
                await A.fetch('tables/store_items/' + encodeURIComponent(existing.id), {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                customUpdated++;
              }
            } else {
              if (item.code && !/^store\.\d+$/.test(item.code)) payload.id = item.code;
              const created = await A.write('store_items', null, payload);
              if (created && created.id) customById.set(created.id, created);
              customCreated++;
            }
          }
        }
        try { localStorage.removeItem('cms_cache'); } catch (e) {}
        await refreshQuickEditorList(storeSelect.value);
        const refreshBtn = section.querySelector('button.collection-action');
        if (refreshBtn) refreshBtn.click();
        setStatus('✅ 엑셀 업로드 반영 완료: 기본 매장 수정 ' + baseUpdated + '건 · 신규 매장 추가 ' + customCreated + '건 · 추가 매장 수정 ' + customUpdated + '건이 저장되었습니다.');
      } catch (err) {
        console.error('[store-excel] 업로드 실패:', err);
        setStatus('엑셀 업로드 실패: ' + (err && err.message ? err.message : String(err)), true);
      } finally {
        busy = false; dlBtn.disabled = false; ulInput.disabled = false; ulInput.value = '';
      }
    });

    refreshQuickEditorList();
  }

  document.addEventListener('DOMContentLoaded', function () {
    KinoyaCollections.mount({
      section: 'stores-manage-section',
      table: 'store_items',
      fields: [
        {key:'name',label:'매장명 (엑셀 "매장명" 열 · 예: 우동키노야 강남점)',required:true},
        {key:'region',label:'지역 구분 (엑셀 "지역" 열 · 서울지역 / 전국 각지)',options:[['seoul','서울지역 (서울 지역 슬라이더)'],['gyeonggi','전국 각지 · 경기'],['incheon','전국 각지 · 인천'],['chungcheong','전국 각지 · 충청'],['daegu','전국 각지 · 대구'],['busan','전국 각지 · 부산'],['jeju','전국 각지 · 제주']],default:'seoul'},
        {key:'address',label:'도로명/지번 주소 (엑셀 "주소" 열)',required:true},
        {key:'hours',label:'영업시간 (엑셀 "영업시간" 열 · 예: 11:00 ~ 21:00 (BT 15:00~17:00, LO 20:30))'},
        {key:'closed_days',label:'휴무일 (엑셀 "휴무일" 열 · 예: 연중무휴 / 매주 월요일 정기휴무)'},
        {key:'meta',label:'한줄소개·특징 (엑셀 "한줄소개" 열 · 예: 🍜 직영점, 신용산역/용산역 인근, 주차 가능)'},
        {key:'phone',label:'전화번호 (엑셀 "전화번호" 열 · 예: 0507-1408-1984)'},
        {key:'naver_map_url',label:'네이버맵 링크 (엑셀 "네이버맵링크" 열 · 비우면 매장명으로 자동 연결)',url:true},
        {key:'google_map_url',label:'구글맵 링크 (엑셀 "구글맵링크" 열 · 비우면 매장명으로 자동 연결)',url:true},
        {key:'kakao_map_url',label:'카카오맵 링크 (엑셀 "카카오맵링크" 열 · 비우면 매장명으로 자동 연결)',url:true},
        {key:'tmap_url',label:'티맵 링크 (엑셀 "티맵링크" 열 · 비우면 매장명으로 자동 연결)',url:true},
        {key:'detail_url',label:'상세페이지 링크 (엑셀 "상세페이지링크" 열 · 예: yongsan/ · 선택)',url:true},
        {key:'sort_order',label:'표시 순서 (엑셀 "표시순서" 열 · 작을수록 먼저 표시)',type:'number',default:0},
        {key:'is_published',label:'공개여부 (엑셀 "공개여부" 열 · 체크 시 공개 화면에 표시)',type:'checkbox'},
        {key:'photo',label:'매장 대표 사진 (선택 · 사진 없이 데이터만 먼저 등록 가능 · PNG 600KB 이하 자동 변환)',type:'file',image:true,accept:'image/png,image/jpeg,image/webp,image/gif'}
      ]
    });
    const section = document.getElementById('stores-manage-section');
    if (section) mountExcelToolbarAndReferenceEditor(section);
  });
})();

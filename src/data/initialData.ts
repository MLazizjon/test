// Initial mock data for EDU CRM

export interface Student {
  id: string;
  name: string;
  phone: string;
  groupId: string;
  balance: number;
  status: 'faol' | 'arxiv';
  lastAction: string;
  lastActionType: string;
  photo: string;
}

export interface Teacher {
  id: string;
  name: string;
  initials: string;
  phone: string;
  subject: string;
  groupIds: string[];
  status: 'faol' | 'dam_olishda';
  photo: string;
}

export interface Group {
  id: string;
  name: string;
  course: string;
  teacherId: string;
  days: string;
  time: string;
  maxStudents: number;
  status: 'faol' | 'yakunlangan' | 'kutilmoqda';
  icon: string;
  color: string;
}

export interface AttendanceRecord {
  groupId: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'excused';
}

export interface TeacherAttendanceRecord {
  teacherId: string;
  date: string;
  arrivedAt: string;
  leftAt: string;
  status: 'kelgan' | 'kechikkan' | 'kelmagan';
  workHours: number;
  note: string;
}

export interface Settings {
  centerName: string;
  phone: string;
  email: string;
  address: string;
  inn: string;
  currency: string;
  lessonDuration: number;
  workStart: string;
  dayOff: string;
  smsEnabled: boolean;
  telegramEnabled: boolean;
  paymentReminder: boolean;
}

export const initialTeachers: Teacher[] = [
  { id: 't1', name: 'Alisher Usmonov', initials: 'AU', phone: '+998 90 123 45 67', subject: "Ingliz tili (IELTS)", groupIds: ['g1', 'g3'], status: 'faol', photo: '' },
  { id: 't2', name: 'Malika Ahmadova', initials: 'MA', phone: '+998 93 987 65 43', subject: 'Matematika', groupIds: ['g5'], status: 'faol', photo: '' },
  { id: 't3', name: 'Sarvar Ismoilov', initials: 'SI', phone: '+998 99 543 21 00', subject: 'Fizika', groupIds: ['g6'], status: 'dam_olishda', photo: '' },
  { id: 't4', name: 'Sevinch Karimova', initials: 'SK', phone: '+998 90 456 78 90', subject: 'Ona tili', groupIds: ['g7'], status: 'faol', photo: '' },
  { id: 't5', name: 'Jasur Akromov', initials: 'JA', phone: '+998 94 555 11 22', subject: 'Frontend', groupIds: ['g2', 'g8'], status: 'faol', photo: '' },
  { id: 't6', name: 'Malika Salieva', initials: 'MS', phone: '+998 91 222 33 44', subject: 'UI/UX Dizayn', groupIds: ['g4'], status: 'faol', photo: '' },
  { id: 't7', name: 'Dilshod Norov', initials: 'DN', phone: '+998 95 111 22 33', subject: 'IELTS', groupIds: ['g1'], status: 'faol', photo: '' },
  { id: 't8', name: 'Farhod Jumayev', initials: 'FJ', phone: '+998 97 333 44 55', subject: 'Logika & Math', groupIds: ['g9'], status: 'faol', photo: '' },
  { id: 't9', name: 'Aliyor Boltayev', initials: 'AB', phone: '+998 90 444 55 66', subject: '3ds Max & Vray', groupIds: ['g10'], status: 'faol', photo: '' },
  { id: 't10', name: 'Nilufar Karimova', initials: 'NK', phone: '+998 93 555 66 77', subject: 'Grafik Dizayn', groupIds: ['g4'], status: 'faol', photo: '' },
];

export const initialGroups: Group[] = [
  { id: 'g1', name: 'IELTS Foundation', course: 'IELTS Foundation', teacherId: 't7', days: 'Dush, Chor, Juma', time: '18:30 - 20:30', maxStudents: 12, status: 'faol', icon: 'globe', color: 'bg-blue-100' },
  { id: 'g2', name: 'Frontend Bootcamp #12', course: 'React.js Advanced', teacherId: 't5', days: 'Dush, Chor, Juma', time: '14:00 - 16:00', maxStudents: 15, status: 'faol', icon: 'monitor', color: 'bg-sky-100' },
  { id: 'g3', name: 'IELTS Masterclass', course: 'IELTS Masterclass', teacherId: 't1', days: 'Sesh, Pay, Shan', time: '09:00 - 10:30', maxStudents: 15, status: 'faol', icon: 'book-open', color: 'bg-green-100' },
  { id: 'g4', name: 'UI/UX Dizayn #05', course: 'UI/UX Designer', teacherId: 't6', days: 'Sesh, Pay, Shan', time: '10:00 - 12:00', maxStudents: 15, status: 'faol', icon: 'palette', color: 'bg-yellow-100' },
  { id: 'g5', name: 'Logika & Math', course: 'Matematika', teacherId: 't2', days: 'Dush, Chor, Juma', time: '14:00 - 15:30', maxStudents: 20, status: 'faol', icon: 'calculator', color: 'bg-purple-100' },
  { id: 'g6', name: 'Fizika Asoslari', course: 'Fizika', teacherId: 't3', days: 'Sesh, Pay, Shan', time: '16:00 - 17:30', maxStudents: 18, status: 'kutilmoqda', icon: 'atom', color: 'bg-orange-100' },
  { id: 'g7', name: "Ona tili va Adabiyot", course: 'Ona tili', teacherId: 't4', days: 'Dush, Chor, Juma', time: '09:00 - 10:30', maxStudents: 20, status: 'faol', icon: 'book-text', color: 'bg-pink-100' },
  { id: 'g8', name: 'Python Core #22', course: 'Backend Core', teacherId: 't5', days: 'Sesh, Pay, Shan', time: '16:00 - 18:00', maxStudents: 15, status: 'faol', icon: 'code', color: 'bg-emerald-100' },
  { id: 'g9', name: 'Logika va Mantiq', course: 'Logika & Math', teacherId: 't8', days: 'Dush, Chor, Juma', time: '14:00 - 15:30', maxStudents: 20, status: 'yakunlangan', icon: 'puzzle', color: 'bg-indigo-100' },
  { id: 'g10', name: '3ds Max & Vray', course: '3D Modellashtirish', teacherId: 't9', days: 'Dush, Chor, Juma', time: '14:00 - 16:00', maxStudents: 10, status: 'faol', icon: 'building', color: 'bg-rose-100' },
];

const studentNames = [
  'Abbos Januzakov', 'Madina Ergasheva', 'Jasur Karimov', 'Sardor Toshpolatov',
  'Otabek Torayev', 'Malika Sobirova', 'Diyorbek Umarov', 'Alijonov Valisher',
  'Sodiqova Gulruh', 'Karimov Sherzod', 'Nazarova Malika', 'Ismoilov Jasur',
  'Rustamova Sevara', 'Xalilov Diyor', 'Bekmirov Umid', 'Anvarov Aziz',
  'Toshmatov Bobur', "Yo'ldoshev Kamol", 'Usmonova Nilufar', "Jo'rayeva Barno",
  'Saidov Mansur', 'Qodirova Shahlo', 'Rahimov Shoxrux', 'Tursunova Dildora',
  'Mirzayev Sardor', 'Kamolov Asror', 'Ergasheva Zulfiya', 'Normatov Ulugbek',
  'Xasanova Mohinur', 'Sobirov Islom',
];

// Generate more students: 10-15-20 per group
const extraStudentNames = [
  'Sardor Alimov', 'Nilufar Rashidova', 'Bekzod Tursunov', 'Shaxlo Mirzayeva',
  'Dilmurod Xasanov', 'Gavhar Normatova', 'Shohrux Abdullayev', 'Zilola Ergasheva',
  'Nodir Karimov', 'Maftuna Saydullayeva', 'Asilbek Jurayev', 'Mohira Umarova',
  'Eldor Botirov', 'Kamola Xolmatova', 'Shamsiddin Raxmatov', 'Barno Qosimova',
  'Ibrohim Toshpulatov', 'Yulduz Kamalova', 'Ravshan Sobirov', 'Gulbahor Aliyeva',
  'Sanjar Murodov', 'Feruza Nishonova', 'Oybek Rahmonov', 'Dilorom Usmonova',
  'Javlon Xoliqov', 'Madina Sultonova', 'Akbar Mirzoqulov', 'Nafisa Jumayeva',
  'Ulugbek Rahimov', 'Shirin Iskandarova', 'Behruz Azimov', 'Sabrina Qurbonova',
  'Tohir Salimov', 'Zarina Ibragimova', 'Farrux Hamidov', 'Laylo Mahmudova',
  'Husan Olimov', 'Sitora Nabiyeva', 'Abror Nurmatov', 'Dilnoza Saidova',
  'Odil Ruziyev', 'Zamira Toxirova', 'Komil Sattarov', 'Xurshida Qoraboyeva',
  'Mirzo Sharipov', 'Aziza Turdiyeva', 'Dostonbek Umidov', 'Shoira Mirkomilova',
  'Elbek Choriyev', 'Nargiza Alimova', 'Umidjon Xaydarov', 'Hilola Jaloliddinova',
  'Botir Raximov', 'Malika Qodirberdiyeva', 'Sunnat Yusupov', 'Sevinch Otajonova',
  'Lazar Nurullayev', 'Robiya Inomova', 'Temur Baxtiyorov', 'Ozoda Ergashova',
  'Doniyor Abduraxmonov', 'Kumush Abdurahmonova', 'Otabek Ismoilov', 'Mohinur Sharipova',
  'Murodjon Qobilov', 'Nasiba Xolmatova', 'Xurshid Tuxtasinov', 'Iroda Qosimova',
  'Furqat Mamatov', 'Surayyo Ahmedova', 'Jasurbek Raxmonov', 'Dilrabo Nurullayeva',
  'Sarvarbek Xolmatov', 'Barcha Toshmatova', 'Baxtiyor Solijonov', 'Shahzoda Karimova',
  'Muzaffar Rustamov', 'Gulasal Ergasheva', 'Davron Xolmurodov', 'Lobar Haydarova',
  'Mansurbek Toshpulatov', 'Nozima Alimova', 'Shuhrat Mirzayev', 'Zulfizar Juraeva',
  'Ortiq Nurmatov', 'Oydin Mahmudova', 'Islomjon Turdiqulov', 'Farzona Saidova',
  'Azamjon Ibragimov', 'Gulnora Xasanova',
];

const allNames = [...studentNames, ...extraStudentNames];
const groupStudentCounts = [12, 15, 10, 14, 20, 18, 13, 11, 16, 10]; // 10-20 per group

export const initialStudents: Student[] = (() => {
  const result: Student[] = [];
  let nameIdx = 0;
  initialGroups.forEach((group, gi) => {
    const count = groupStudentCounts[gi] || 12;
    for (let j = 0; j < count && nameIdx < allNames.length; j++, nameIdx++) {
      result.push({
        id: `s${nameIdx + 1}`,
        name: allNames[nameIdx],
        phone: `+998 ${90 + (nameIdx % 5)}${nameIdx} ${100 + nameIdx * 3} ${10 + nameIdx * 2} ${50 + nameIdx}`,
        groupId: group.id,
        balance: [1200000, -450000, 0, 50000, 800000, -200000, 350000, 0, 1500000, -100000][nameIdx % 10],
        status: nameIdx === 13 ? 'arxiv' : 'faol',
        lastAction: ['Bugun, 14:20', 'Kecha, 18:00', '05 Okt, 10:15', '04 Okt, 15:40', 'Bugun, 09:30'][nameIdx % 5],
        lastActionType: ['DARSDA QATNASHDI', 'SMS YUBORILDI', "TO'LOV AMALGA OSHIRDI", 'DARSDA QATNASHDI', 'DARSGA KELDI'][nameIdx % 5],
        photo: '',
      });
    }
  });
  return result;
})();

export const initialSettings: Settings = {
  centerName: 'IT SAF CENTER',
  phone: '+998 71 200 00 00',
  email: 'info@itsaf.uz',
  address: "Toshkent sh., Yunusobod tumani, 4-kvartal, 14-uy",
  inn: '123 456 789',
  currency: 'UZS',
  lessonDuration: 90,
  workStart: '08:00',
  dayOff: 'Yakshanba',
  smsEnabled: true,
  telegramEnabled: true,
  paymentReminder: false,
};

function normalizePhoneForAccount(phone: string) {
  return phone.replace(/\D/g, '') || phone.trim();
}

export const userAccounts = [
  { username: 'admin', password: 'admin123', role: 'admin' as const, teacherId: null, name: "Azizbek G'ulomov" },
  ...initialTeachers.map((t) => ({
    username: normalizePhoneForAccount(t.phone),
    password: normalizePhoneForAccount(t.phone),
    role: 'teacher' as const,
    teacherId: t.id,
    name: t.name,
  })),
];

import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* <div className="lg:pl-[max(125px,14vw)] px-10 w-full z-20 lg:pb-10 pt-5">
        <div className="relative max-w-7xl w-full flex flex-col-reverse gap-6 lg:flex-row-reverse lg:justify-between md:gap-10">
          <div className="flex flex-col justify-center items-end flex-grow text-right">
          <img src="/img/mob.png" alt="สมาคมศิษย์เก่าโรงเรียนโรงเรียนมหิดลวิทยานุสรณ์" className="h-20 rounded" />
          </div>
          <div className="flex flex-col justify-center items-end flex-grow text-right">
            <p className="text-xl lg:text-3xl font-bold">กองทุนแบ่งสรรปันน้อง</p>
          </div>
        </div>
        
      </div> */}
      <div className="max-w-7xl mx-auto lg:py-5 px-5">
        <div className="text-center mb-4 lg:mb-16 lg:mt-12">
            <h1 className="text-3xl md:text-5xl font-bold">กองทุนแบ่งสรรปันน้อง</h1>
            <p className="mt-4 text-md lg:text-xl font-medium">ร่วมส่งต่อโอกาสดีๆ ที่เราได้รับ ผ่านการบริจาค</p>
            <div className="mt-5 mb-4 inline-block bg-yellow-400 text-teal-900 px-8 py-4 rounded-full font-semibold text-xl lg:text-3xl">
                บริจาคตอนนี้ เพียง 3 ขั้นตอน
            </div>
            <p className="mt-2 text-md lg:text-xl">การบริจาคของคุณสามารถลดหย่อนภาษีได้ 2 เท่า</p>
        </div>
        <div className="bg-teal-800 rounded-lg p-6 text-center">
            <div className="mb-6">
                <p className="text-xl lg:text-2xl font-bold">ข้อมูล ณ วันที่ 13 ธันวาคม 2567 เวลา 13.30 น.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white text-teal-900 p-4 rounded-lg">
                    <p className="text-sm font-semibold">เป้าหมายบริจาค</p>
                    <p className="text-2xl font-bold">750,000 บาท</p>
                </div>
                <div className="bg-white text-teal-900 p-4 rounded-lg">
                    <p className="text-sm font-semibold">ยอดเงินบริจาค ณ ปัจจุบัน</p>
                    <p className="text-2xl font-bold">437,910.19 บาท</p>
                </div>
                <div className="bg-white text-teal-900 p-4 rounded-lg">
                    <p className="text-sm font-semibold">จำนวนผู้บริจาค ณ ปัจจุบัน</p>
                    <p className="text-2xl font-bold">98 คน</p>
                </div>
            </div>
        </div>

        <div className="mt-10">
            <h2 className="text-2xl font-bold text-yellow-400">เป้าหมายกองทุน</h2>
            <ul className="list-decimal list-inside mt-4 space-y-2 text-lg">
                <li>เพื่อเป็นทุนการศึกษาให้นักเรียนปัจจุบันที่ต้องการความช่วยเหลือด้านทุนทรัพย์</li>
                <li>เพื่อเป็นทุนการศึกษาสำหรับนักเรียนในการทำกิจกรรมบำเพ็ญประโยชน์</li>
                <li>เพื่อเป็นทุนการศึกษาสำหรับนักเรียนในการนำเสนอโครงการหรือการเข้าร่วมการแข่งขันทั้งในและต่างประเทศ</li>
                <li>เพื่อเป็นทุนการศึกษาสำหรับกิจกรรมของคณะกรรมการสภานักเรียน</li>
            </ul>
        </div>
        <div className="mt-10">
          <img src="/img/mob.png" alt="สมาคมศิษย์เก่าโรงเรียนโรงเรียนมหิดลวิทยานุสรณ์" className="rounded-lg shadow-lg" />
        </div>
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white text-teal-900 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-[#204297] mb-4">1</div>
              <p className="font-semibold text-2xl mb-2">โอนเงินเข้าบัญชี<br/>โรงเรียนมหิดลวิทยานุสรณ์</p>
              <p className="text-lg">บริจาคเงินเข้าระบบ E-DONATION<br/>เป้าตุง เติมบุญ</p>
              <p className="font-bold mt-2">กองบุญ : 09940000521472001</p>
              <div className="mt-4">
                <img src="/img/qr-schhol.png" alt="QR Code" className="mx-auto h-64"/>
              </div>
              <p className="mt-2 text-xl font-semibold">บัญชีโรงเรียนมหิดลวิทยานุสรณ์<br/>ธนาคารกรุงไทย</p>
              <p className="font-bold text-yellow-400">เลขที่บัญชี 459-0-47124-8</p>
          </div>
          <div className="bg-white text-teal-900 p-6 rounded-lg text-center">
              <div className="text-4xl font-bold text-[#204297] mb-4">2</div>
              <p className="font-semibold text-2xl mb-2">แจ้งข้อมูลการโอนเงินบริจาค</p>
              <p className="text-xl mb-4">มายัง กิจกรรมนักเรียนเก่า</p>
              <div className="rounded-lg inline-block lg:mt-8 mb-5">
                  <img src="/img/qr-ggf.png" alt="Form QR Code" className="mx-auto h-64"/>
              </div>
              <div className="mt-4">
                  <a href="https://tiny.mwit.link/alumni-donation" className="bg-yellow-400 text-teal-900 px-8 py-2 rounded-full font-semibold text-lg lg:text-xl" target="_blank">CLICK LINK</a>
              </div>
          </div>
          <div className="bg-white text-teal-900 p-6 rounded-lg text-center lg:content-center">
              <div className="text-4xl font-bold text-[#204297] mb-4">3</div>
              <div className="">
                <p className="font-semibold text-2xl mb-2">รอรับเอกสารตามที่อยู่ที่แจ้งไว้</p>
                <p className="text-xl">ขอขอบคุณทุก ๆ ท่านที่ร่วมกันส่งต่อโอกาสดีดีให้กับน้องๆ นะครับ</p>
              </div>
          </div>
        </div>
        <div className="mt-10 bg-teal-800 rounded-lg p-6">
            <h2 className="text-xl lg:text-3xl font-bold text-center mb-6"><p className="text-2xl lg:text-5xl">Q&A</p><br/> คำถามและคำตอบเกี่ยวกับทุนการศึกษา</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:text-lg">
                <div className="bg-teal-700 p-5 rounded-lg">
                    <h3 className="font-bold text-yellow-400 mb-2">📚 1. รายละเอียดและหลักเกณฑ์การจัดสรรทุนการศึกษา</h3>
                    <p className="text-sm leading-relaxed">
                        ทุนการศึกษาสำหรับนักเรียนที่มีความประสงค์ช่วยเหลือด้านทุนทรัพย์เป็นรายปี กองทุนนี้จะสะสมทุนไว้สำหรับ 2 ปีการศึกษา <br/>
                        <strong>ทุนประจำปีการศึกษา 2567</strong> : จำนวน 18 ทุน งบประมาณ 240,000 บาท
                    </p>
                    <ul className="list-disc text-sm ml-5 mt-2">
                        <li>มูลค่าทุนละ 25,000 บาท</li>
                        <li>มูลค่าทุนละ 15,000 บาท</li>
                        <li>มูลค่าทุนละ 10,000 บาท</li>
                        <li>มูลค่าทุนละ 5,000 บาท</li>
                    </ul>
                </div>
                <div className="bg-teal-700 p-5 rounded-lg">
                    <h3 className="font-bold text-yellow-400 mb-2">📚 2. เหตุผลในการดำเนินการจัดหาทุนสนับสนุนเพิ่มเติม</h3>
                    <p className="text-sm leading-relaxed">
                        เนื่องด้วยทุนการศึกษาสำหรับนักเรียนที่ขาดแคลนทุนทรัพย์ยังคงอยู่ในเงื่อนไขการเบิกจ่ายงบประมาณของภาครัฐ 
                    </p>
                </div>
                <div className="bg-teal-700 p-5 rounded-lg">
                    <h3 className="font-bold text-yellow-400 mb-2">📚 3. ทุนสนับสนุนการนำเสนอผลงานและการแข่งขันทางวิชาการ</h3>
                    <p className="text-sm leading-relaxed">
                        งบประมาณการจัดสรร: 100,000 บาทต่อปีการศึกษา<br/>
                        จำนวนทุนที่จัดสรร: 5-10 ทุน
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState({ donation: "Loading...", donors: "Loading..." });

  useEffect(() => {
    fetch(
      "https://mocha.api.meaookung144.xyz/alumni"
    )
      .then((response) => response.json())
      .then((data) => {
        const values = data.values || [];
        setData({
          donation: values[0]?.[0] ? `${values[0][0]} บาท` : "Data not available",
          donors: values[1]?.[0] ? `${values[1][0]} คน` : "Data not available",
        });
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setData({ donation: "Error", donors: "Error" });
      });
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto lg:py-5 px-5">
        {/* Header Section */}
        <div className="text-center mb-4 lg:mb-16 lg:mt-12">
          <h1 className="text-3xl md:text-5xl font-bold">กองทุนแบ่งสรรปันน้อง</h1>
          <p className="mt-4 text-md lg:text-xl font-medium">
            ร่วมส่งต่อโอกาสดีๆ ที่เราได้รับ ผ่านการบริจาค
          </p>
          <a href="#howtodonate">
            <div className="mt-5 mb-4 inline-block bg-yellow-400 text-teal-900 px-8 py-4 rounded-full font-semibold text-xl lg:text-3xl">
              บริจาคตอนนี้ เพียง 3 ขั้นตอน
            </div>
          </a>
          <p className="mt-2 text-md lg:text-xl">
            การบริจาคของคุณสามารถลดหย่อนภาษีได้ 2 เท่า
          </p>
        </div>

        {/* Donation Data */}
        <div className="bg-teal-800 rounded-lg p-6 text-center">
          <div className="mb-6">
            <p className="text-xl lg:text-2xl font-bold">
              ข้อมูล ณ วันที่ {new Date().toLocaleDateString("th-TH", {
              year: "numeric",
              month: "long",
              day: "numeric",
              })} เวลา {new Date().toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              })}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white text-teal-900 p-4 rounded-lg">
              <p className="text-sm font-semibold">เป้าหมายบริจาค</p>
              <p className="text-2xl font-bold">750,000 บาท</p>
            </div>
            <div className="bg-white text-teal-900 p-4 rounded-lg">
              <p className="text-sm font-semibold">ยอดเงินบริจาค ณ ปัจจุบัน</p>
              <p className="text-2xl font-bold">{data.donation}</p>
            </div>
            <div className="bg-white text-teal-900 p-4 rounded-lg">
              <p className="text-sm font-semibold">จำนวนผู้บริจาค</p>
              <p className="text-2xl font-bold">{data.donors}</p>
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold text-yellow-400">เป้าหมายกองทุน</h2>
          <ul className="list-decimal list-inside mt-4 space-y-2 text-lg">
            <li>เพื่อเป็นทุนการศึกษาให้นักเรียนปัจจุบันที่ต้องการความช่วยเหลือด้านทุนทรัพย์</li>
            <li>เพื่อเป็นทุนการศึกษาสำหรับนักเรียนในการทำกิจกรรมบำเพ็ญประโยชน์</li>
            <li>เพื่อเป็นทุนการศึกษาสำหรับนักเรียนในการนำเสนอโครงการหรือการเข้าร่วมการแข่งขันทั้งในและต่างประเทศ</li>
            <li>เพื่อเป็นทุนการศึกษาสำหรับกิจกรรมของคณะกรรมการสภานักเรียน</li>
          </ul>
        </div>

        {/* Image Section */}
        <div className="mt-10">
          <img
            src="/img/mob.png"
            alt="สมาคมศิษย์เก่าโรงเรียนโรงเรียนมหิดลวิทยานุสรณ์"
            className="rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

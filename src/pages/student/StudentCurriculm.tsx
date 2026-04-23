import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "../../helpers/api";
import { FaFolder, FaBook, FaClock, FaPlayCircle } from "react-icons/fa";

interface Lesson {
  id: number;
  day: string;
  topic: string;
  introduction: string;
  resources: string | null;
}

interface LessonsByDate {
  [date: string]: Lesson[];
}

const StudentCurriculum = () => {
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);
  const [lessonsByDate, setLessonsByDate] = useState<LessonsByDate>({});
  const [error, setError] = useState<string | null>(null);

  const fetchCurriculum = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setLoadingCurriculum(true);
    setError(null);

    try {
      const response = await api.get("/api/student/weekly-lessons", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const lessons = response.data?.data?.lessons || response.data?.lessons;
        setLessonsByDate(lessons || {});
      }
    } catch (error: any) {
      const errMessage = error.response?.data?.message || error.response?.data?.data || error.message;
      setError(errMessage);
      toast.error(errMessage || "Failed to load curriculum");
    } finally {
      setLoadingCurriculum(false);
    }
  };

  useEffect(() => {
    fetchCurriculum();
  }, []);

  const dates = Object.keys(lessonsByDate);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Curriculum</h2>

      {loadingCurriculum ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-gray-500">Loading curriculum...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
            <FaBook className="text-red-500 text-2xl" />
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      ) : dates.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FaBook className="text-gray-400 text-2xl" />
          </div>
          <p className="text-gray-600">No curriculum available yet</p>
        </div>
      ) : (
        dates.map((date) => (
          <div key={date}>
            <div className="flex items-center gap-2 mb-4">
              <FaClock className="text-purple" />
              <h3 className="text-lg font-semibold text-gray-800">{date}</h3>
            </div>

            <div className="space-y-4">
              {(lessonsByDate[date] || []).map((lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                  <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Day {lesson.day}</span>
                  </div>

                  <div className="p-4 md:flex md:items-start md:gap-6">
                    <div className="mb-4 md:mb-0 md:w-1/4">
                      <p className="text-xs font-medium text-purple uppercase mb-1">Topic</p>
                      <h4 className="text-gray-900 font-semibold">{lesson.topic}</h4>
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-medium text-purple uppercase mb-1">Introduction</p>
                      <p className="text-gray-700">{lesson.introduction}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-4 md:mt-0">
                      {lesson.resources ? (
                        <a
                          href={lesson.resources}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-purple text-white rounded-lg text-sm hover:bg-purple/90 transition"
                        >
                          <FaPlayCircle />
                          Resources
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">No resources</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentCurriculum;
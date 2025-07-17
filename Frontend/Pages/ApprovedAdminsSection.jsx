import React from "react";
import { useOutletContext } from "react-router-dom";

export default function ApprovedAdminsSection() {
  const { admins } = useOutletContext();

  return (
    <section className="p-4 md:p-8 text-white">
      <h3 className="text-lg md:text-xl lg:text-2xl font-semibold mb-4 md:mb-6">
        🧑‍💼 Approved Admins
      </h3>
      
      {admins.length === 0 ? (
        <p className="text-gray-300 text-center py-8 text-sm md:text-base">
          No approved admins found.
        </p>
      ) : (
        <div className="bg-gray-800/50 rounded-lg p-4 md:p-6 shadow-lg">
          <ul className="space-y-3">
            {admins.map((admin, index) => (
              <li 
                key={index} 
                className="flex items-center p-3 md:p-4 bg-gray-700/50 rounded-lg hover:bg-gray-600/50 transition-colors duration-200 border-l-4 border-blue-500"
              >
                <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3 md:mr-4">
                  <span className="text-white font-bold text-sm md:text-base">
                    {admin.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-sm md:text-base font-medium text-white">
                    {admin.username}
                  </span>
                  <div className="flex items-center mt-1">
                    <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    <span className="text-xs md:text-sm text-green-400 font-medium">
                      Active Admin
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
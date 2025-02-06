import React from "react";
import logo from "../assets/logoBookNest.jpg";
import image from "../assets/example.png";
import { Link } from "react-router-dom";

const LandingPage: React.FC = () => {
  return (
    <section className="max-h-screen overflow-auto inset-0 -z-10 h-full w-full bg-gray-200 bg-[linear-gradient(to_right,#cfd1d5_1px,transparent_1px),linear-gradient(to_bottom,#cfd1d5_1px,transparent_1px)] bg-[size:6rem_4rem]">
      {/* Sticky Logo */}
      <img
        src={logo}
        alt="Logo"
        className="fixed top-6 right-6 w-16 h-16 rounded-full border-2 border-gray-200 shadow-lg hidden md:block" // Hide on small screens
      />

      <div className="container flex flex-col justify-center p-6 mx-auto lg:flex-row lg:justify-between">
        <div className="flex flex-col justify-center text-center rounded-lg lg:max-w-lg lg:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 sm:mb-8 text-gray-900">
            Bem vindo ao <span className="text-[#FF6F61]">BookNest</span>
          </h1>
          <p className="text-base md:text-lg leading-relaxed mb-6 text-gray-600">
            Crie, armazene, edite
            <br />
            Compartilhe-as e pesquise por anotações <br />
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <div className="bg-[#FF6F61] w-40 h-20 p-4 rounded-lg   dow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center">
              <Link to="/login" className="block w-full">
                <h2 className="text-base md:text-lg font-semibold text-white text-center">
                  Entar
                </h2>
              </Link>
            </div>
            <div className="bg-[#fcf2d9] w-40 h-20 p-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center">
              <Link to="/register" className="block w-full">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 text-center">
                  Registar
                </h2>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center mt-8 lg:mt-0 h-64 md:h-80 lg:h-96 xl:h-104">
          <img
            src={image}
            alt="Landing Page Illustration"
            className="object-contain h-full w-full rounded-lg shadow-xl"
          />
        </div>
      </div>
    </section>
  );
};

export default LandingPage;

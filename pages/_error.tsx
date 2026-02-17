import React from 'react';
import { NextPageContext } from 'next';
import Head from 'next/head';

interface ErrorProps {
  statusCode?: number;
  hasGetInitialPropsRun?: boolean;
  err?: Error;
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <>
      <Head>
        <title>
          {statusCode
            ? `${statusCode} - Грешка на серверот`
            : 'Грешка на клиентот'}
        </title>
      </Head>
      
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-orange-500 mb-4">
            {statusCode || 'Грешка'}
          </h1>
          
          <h2 className="text-2xl font-semibold mb-4">
            {statusCode === 404
              ? 'Страницата не е пронајдена'
              : statusCode === 500
              ? 'Внатрешна грешка на серверот'
              : statusCode
              ? 'Се случи грешка на серверот'
              : 'Се случи грешка на клиентот'}
          </h2>
          
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            {statusCode === 404
              ? 'Страницата што ја барате не постои или е преместена.'
              : 'Извинете, се случи неочекувана грешка. Ве молиме обидете се повторно.'}
          </p>
          
          <div className="space-x-4">
            <button
              onClick={() => window.history.back()}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Назад
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Почетна страница
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default ErrorPage;
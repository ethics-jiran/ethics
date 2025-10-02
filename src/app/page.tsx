import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Image
          src="/logo.svg"
          alt="Cherish Logo"
          width={150}
          height={150}
          className="mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold mb-4">지란지교패밀리</h1>
        <p className="text-gray-600 mb-8">윤리경영 제보관리센터 </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/inquiry"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90"
          >
            제보하기
          </a>
          <a
            href="/inquiry/check"
            className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:opacity-90"
          >
            제보 조회
          </a>
          <a
            href="/login"
            className="inline-block border border-border px-6 py-3 rounded-lg hover:bg-muted"
          >
            관리자 로그인
          </a>
        </div>
      </div>
    </div>
  );
}

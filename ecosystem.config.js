module.exports = {
  apps: [
    {
      name: "my-scheduled-app",
      script: "./app.js", // 여기서는 실제 스크립트 파일 경로를 사용합니다.
      instances: "max", // CPU 코어 수에 따라 인스턴스를 자동으로 확장합니다.
      autorestart: true, // 프로세스 실패 시 자동 재시작
      watch: false, // 파일이 변경되면 앱을 자동으로 재시작합니다 (개발 중에 유용).
      max_memory_restart: "1G", // 지정된 메모리를 초과하면 앱을 재시작합니다.
      env: {
        NODE_ENV: "production", // 프로덕션 환경에서의 환경 변수
      },
    },
  ],
};

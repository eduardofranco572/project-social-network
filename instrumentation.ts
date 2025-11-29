export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    
    if ((global as any).workersStarted) return;
    (global as any).workersStarted = true;

    const { Worker } = await import('worker_threads');
    const path = await import('path');

    const workers = [
      { 
        name: 'Image Classifier', 
        file: 'src/workers/consumers/imageProcessing.ts' 
      },
      { 
        name: 'User Interactions', 
        file: 'src/workers/consumers/userInteractions.ts' 
      },
    ];

    console.log('[Instrumentation] Iniciando Workers...');

    workers.forEach((workerConfig) => {
      const workerPath = path.join(process.cwd(), workerConfig.file);

      const worker = new Worker(workerPath, {
        execArgv: ['--import', 'tsx'] 
      });

      worker.on('online', () => console.log(`[System] Thread "${workerConfig.name}" ON.`));
      worker.on('exit', (code) => console.log(`[System] Thread "${workerConfig.name}" OFF (Code ${code}).`));
    });
  }
}
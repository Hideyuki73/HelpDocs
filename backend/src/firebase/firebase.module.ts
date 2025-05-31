import { Global, Module } from '@nestjs/common';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as serviceAccount from '../../firebase-service-account.json';

@Global()
@Module({
  providers: [
    {
      provide: 'FIRESTORE',
      useFactory: () => {
        const app = initializeApp({
          credential: cert(serviceAccount as any),
        });
        return getFirestore(app);
      },
    },
  ],
  exports: ['FIRESTORE'],
})
export class FirebaseModule {}

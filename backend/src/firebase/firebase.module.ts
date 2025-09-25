import { Global, Module } from '@nestjs/common';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';
import serviceAccount from '../../firebase-service-account.json';

@Global()
@Module({
  providers: [
    {
      provide: 'FIRESTORE',
      useFactory: () => {
        // Verificar se já existe uma app inicializada
        let app;
        if (getApps().length === 0) {
          // Criar uma cópia do serviceAccount para evitar problemas de mutação
          const serviceAccountConfig = {
            type: serviceAccount.type,
            project_id: serviceAccount.project_id,
            private_key_id: serviceAccount.private_key_id,
            private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
            client_email: serviceAccount.client_email,
            client_id: serviceAccount.client_id,
            auth_uri: serviceAccount.auth_uri,
            token_uri: serviceAccount.token_uri,
            auth_provider_x509_cert_url:
              serviceAccount.auth_provider_x509_cert_url,
            client_x509_cert_url: serviceAccount.client_x509_cert_url,
            universe_domain: serviceAccount.universe_domain,
          };

          app = initializeApp({
            credential: cert(serviceAccountConfig as admin.ServiceAccount),
          });
        } else {
          app = getApps()[0];
        }
        return getFirestore(app);
      },
    },
  ],
  exports: ['FIRESTORE'],
})
export class FirebaseModule {}

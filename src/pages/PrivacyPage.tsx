import React from 'react';
import { LegalDocumentView } from '../components/legal/LegalDocumentView';
import { privacyDocument } from '../legal/privacy';

export const PrivacyPage: React.FC = () => <LegalDocumentView doc={privacyDocument} />;

export default PrivacyPage;

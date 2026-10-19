import React from 'react';
import { LegalDocumentView } from '../components/legal/LegalDocumentView';
import { termsDocument } from '../legal/terms';

export const TermsPage: React.FC = () => <LegalDocumentView doc={termsDocument} />;

export default TermsPage;

import React from 'react';
import { LegalDocumentView } from '../components/legal/LegalDocumentView';
import { refundDocument } from '../legal/refund';

export const RefundPage: React.FC = () => <LegalDocumentView doc={refundDocument} />;

export default RefundPage;

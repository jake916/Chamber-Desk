import React from 'react';
import { UserCheck } from 'lucide-react';

const ClientWitnessesSection = ({ witnesses }) => {
    if (!witnesses || witnesses.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <UserCheck className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Witnesses</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {witnesses.map((witness, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-semibold text-gray-900">{witness.name}</p>
                        {witness.contact && (
                            <p className="text-sm text-gray-600 mt-1">Contact: {witness.contact}</p>
                        )}
                        {witness.relationship && (
                            <p className="text-sm text-gray-600 mt-1">Relationship: {witness.relationship}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClientWitnessesSection;

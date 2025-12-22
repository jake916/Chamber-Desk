import React from 'react';
import { Users } from 'lucide-react';

const ClientPartiesSection = ({ parties }) => {
    if (!parties || parties.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Parties Involved</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parties.map((party, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-semibold text-gray-900">{party.name}</p>
                        {party.role && (
                            <p className="text-sm text-gray-600 mt-1">Role: {party.role}</p>
                        )}
                        {party.address && (
                            <p className="text-sm text-gray-600 mt-1">Address: {party.address}</p>
                        )}
                        {party.contact && (
                            <p className="text-sm text-gray-600 mt-1">Contact: {party.contact}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClientPartiesSection;

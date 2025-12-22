import React from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const ClientInformation = ({ client }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium text-gray-900">{client.name}</p>
                    </div>
                </div>

                {client.email && (
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">{client.email}</p>
                        </div>
                    </div>
                )}

                {client.phone && (
                    <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-600">Phone</p>
                            <p className="font-medium text-gray-900">{client.phone}</p>
                        </div>
                    </div>
                )}

                {client.address && (
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 text-gray-400" />
                        <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium text-gray-900">{client.address}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientInformation;

// src/pages/AddPatient.js

import React, { useState } from 'react';
import Sidebar from '../components/Layout/Sidebar';
import Header from '../components/Layout/Header';
import PatientForm from '../components/Form/PatientForm';
import { Menu } from 'lucide-react';

const AddPatient = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (

    <div className="flex h-screen bg-slate-100">
      <div className="flex-1 p-8">
        <PatientForm />
      </div>
    </div>


  );
};

export default AddPatient;
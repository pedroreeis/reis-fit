import React, { useState, useEffect, useMemo } from 'react';
import { getUserProfile, saveUserProfile, exportData, importData } from '../services/db';
import { UserProfile } from '../types';
import Icon from '../components/Icon';

const Settings: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>({ id: 1, name: '', gender: 'male', activityLevel: 'moderate' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    async function loadProfile() {
      const data = await getUserProfile();
      if (data) {
        setProfile({
          ...{ gender: 'male', activityLevel: 'moderate' }, // default values
          ...data
        });
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setProfile({ 
        ...profile, 
        [name]: type === 'number' ? (value ? parseFloat(value) : undefined) : value 
    });
  };
  
  const validateProfile = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!profile.name.trim()) {
      newErrors.name = 'O nome é obrigatório.';
    }
    if (profile.weight && profile.weight <= 0) {
      newErrors.weight = 'O peso deve ser um número positivo.';
    }
    if (profile.height && profile.height <= 0) {
      newErrors.height = 'A altura deve ser um número positivo.';
    }
    if (profile.age && (profile.age <= 0 || !Number.isInteger(profile.age))) {
        newErrors.age = 'A idade deve ser um número inteiro positivo.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateProfile()) {
        await saveUserProfile(profile);
        alert('Perfil salvo com sucesso!');
    }
  };
  
  const { bmi, bmiCategory, bmiColor } = useMemo(() => {
    const weight = profile.weight;
    const height = profile.height;
    if (!weight || !height || weight <= 0 || height <= 0) {
      return { bmi: null, bmiCategory: null, bmiColor: 'text-gray-500' };
    }
    const heightInMeters = height / 100;
    const bmiValue = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
    
    let category = '';
    let color = 'text-green-500';
    if (bmiValue < 18.5) { category = 'Abaixo do peso'; color = 'text-blue-500'; }
    else if (bmiValue < 24.9) { category = 'Peso normal'; color = 'text-green-500';}
    else if (bmiValue < 29.9) { category = 'Sobrepeso'; color = 'text-yellow-500'; }
    else if (bmiValue < 34.9) { category = 'Obesidade Grau I'; color = 'text-orange-500'; }
    else if (bmiValue < 39.9) { category = 'Obesidade Grau II'; color = 'text-red-500'; }
    else { category = 'Obesidade Grau III'; color = 'text-red-600'; }
    
    return { bmi: bmiValue, bmiCategory: category, bmiColor: color };
  }, [profile.weight, profile.height]);

  const tdee = useMemo(() => {
    const { weight, height, age, gender, activityLevel } = profile;
    if (!weight || !height || !age || !gender || !activityLevel || weight <= 0 || height <= 0 || age <= 0) {
        return null;
    }

    let bmr = 0;
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else { // female
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
    
    const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
    };
    
    const multiplier = activityMultipliers[activityLevel];
    return Math.round(bmr * multiplier);
  }, [profile.weight, profile.height, profile.age, profile.gender, profile.activityLevel]);

  const handleExport = async () => {
    const data = await exportData();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = `reis-fit-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };
  
  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Isso substituirá todos os dados atuais. Deseja continuar?")) {
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        if (typeof text === 'string') {
          const data = JSON.parse(text);
          await importData(data);
          alert('Dados importados com sucesso! O aplicativo será recarregado.');
          window.location.reload();
        }
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        alert('Falha ao importar o arquivo. Verifique o formato.');
      }
    };
    reader.readAsText(file);
  };


  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Ajustes</h1>
          <Icon name="Dumbbell" size={20} className="text-gray-300 dark:text-gray-600" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg shadow-md space-y-4">
        <h2 className="text-lg font-semibold">Perfil</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome <span className="text-red-500">*</span></label>
          <input type="text" name="name" value={profile.name} onChange={handleChange} className={`mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso (kg)</label>
              <input type="number" name="weight" value={profile.weight || ''} onChange={handleChange} className={`mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white ${errors.weight ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} placeholder="70" />
               {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Altura (cm)</label>
              <input type="number" name="height" value={profile.height || ''} onChange={handleChange} className={`mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white ${errors.height ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} placeholder="175" />
               {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Idade</label>
              <input type="number" name="age" value={profile.age || ''} onChange={handleChange} className={`mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:text-white ${errors.age ? 'border-red-500' : 'border-gray-300 dark:border-slate-600'}`} placeholder="25" />
               {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age}</p>}
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gênero</label>
                <select name="gender" value={profile.gender} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600">
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                </select>
            </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nível de Atividade</label>
            <select name="activityLevel" value={profile.activityLevel} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600">
                <option value="sedentary">Sedentário (pouco ou nenhum exercício)</option>
                <option value="light">Levemente Ativo (1-3 dias/semana)</option>
                <option value="moderate">Moderadamente Ativo (3-5 dias/semana)</option>
                <option value="active">Muito Ativo (6-7 dias/semana)</option>
                <option value="very_active">Extremamente Ativo (trabalho físico + exercício)</option>
            </select>
        </div>
        <button onClick={handleSave} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
          Salvar Perfil
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg shadow-md space-y-4">
        <h2 className="text-lg font-semibold">Métricas de Saúde</h2>
        <div className="text-center grid grid-cols-2 gap-4">
            <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Seu IMC</p>
                {bmi ? (
                    <>
                        <p className={`text-3xl font-bold ${bmiColor}`}>{bmi}</p>
                        <p className={`text-sm font-semibold ${bmiColor}`}>{bmiCategory}</p>
                    </>
                ) : <p className="text-gray-400 mt-2">Preencha peso e altura</p>}
            </div>
             <div>
                <p className="text-sm text-gray-500 dark:text-slate-400">Gasto Calórico Diário</p>
                 {tdee ? (
                    <>
                        <p className="text-3xl font-bold text-gray-700 dark:text-slate-200">{tdee}</p>
                        <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">kcal (est.)</p>
                    </>
                ) : <p className="text-gray-400 mt-2">Preencha os dados do perfil</p>}
            </div>
        </div>
      </div>


      <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg shadow-md space-y-4">
        <h2 className="text-lg font-semibold">Gerenciamento de Dados</h2>
        <p className="text-sm text-gray-600 dark:text-slate-300">Todos os seus dados são armazenados localmente no seu dispositivo. Faça um backup para não perder seu progresso.</p>
        <button onClick={handleExport} className="w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
          Exportar Dados (Backup)
        </button>
        <div>
            <label htmlFor="import-file" className="w-full block text-center bg-gray-600 text-white font-bold py-2 px-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
              Importar Dados
            </label>
            <input id="import-file" type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default Settings;
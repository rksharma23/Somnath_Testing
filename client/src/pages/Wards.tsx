import { useState, useEffect } from "react";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/button/Button";

interface Ward {
  wardId: string;
  name: string;
  age: number;
  grade: string;
  bikeId: string;
  bikeName: string;
  createdAt: string;
  status: string;
}

export default function Wards() {
  const { guardian, addWard, user, loading } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    grade: '',
    bikeName: ''
  });

  console.log("Wards component rendered");

  // Debug logging
  useEffect(() => {
    console.log('Wards page - User:', user);
    console.log('Wards page - Guardian:', guardian);
    console.log('Wards page - Loading:', loading);
  }, [user, guardian, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      await addWard({
        name: formData.name,
        age: parseInt(formData.age),
        grade: formData.grade,
        bikeName: formData.bikeName
      });
      
      setFormData({ name: '', age: '', grade: '', bikeName: '' });
      setShowAddForm(false);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading guardian data...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-600">Please log in to view your wards.</div>
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="Wards | Firefox Dashboard"
        description="Manage your wards and their bikes"
      />
      <PageBreadcrumb pageTitle="Wards" />
      
      <div className="space-y-6">
        {/* Header Section */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              👥 My Wards
            </h3>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white"
            >
              + Add Ward
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage your wards and their associated bikes. Each ward can have their own bike for tracking.
          </p>
        </div>

        {/* Wards List */}
        <div className="space-y-6">
          {guardian?.wards && guardian.wards.length > 0 ? (
            guardian.wards.map((ward: Ward) => (
              <div
                key={ward.wardId}
                className="relative rounded-2xl border border-gray-200 bg-white p-7 shadow-md dark:border-gray-800 dark:bg-white/[0.04] transition-all"
              >
                <div className="flex flex-col items-center justify-center mb-6">
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 text-center">
                    {ward.name}
                  </h4>
                  <p className="text-base text-gray-600 dark:text-gray-300 text-center">
                    {ward.age} years old • Grade {ward.grade}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 absolute top-7 right-7">
                  <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold dark:bg-blue-900/40 dark:text-blue-200">
                    Bike ID: {ward.bikeId}
                  </span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${ward.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200' : 'bg-gray-200 text-gray-700 dark:bg-gray-700/40 dark:text-gray-200'}`}>
                    {ward.status}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800 dark:text-white">
                      {ward.bikeName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Bike Name
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800 dark:text-white">
                      {ward.status}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Status
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800 dark:text-white">
                      {new Date(ward.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Added On
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-md dark:border-gray-800 dark:bg-white/[0.04] text-center flex flex-col items-center">
              <div className="text-5xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                No Wards Yet
              </h3>
              <p className="text-base text-gray-600 dark:text-gray-300 mb-6">
                You haven't added any wards yet. Add your first ward to start tracking their bike.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2 text-base font-semibold rounded-lg"
              >
                Add Your First Ward
              </Button>
            </div>
          )}
        </div>

        {/* Add Ward Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
                Add New Ward
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ward Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="1"
                    max="18"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Grade
                  </label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  >
                    <option value="">Select Grade</option>
                    <option value="1st">1st Grade</option>
                    <option value="2nd">2nd Grade</option>
                    <option value="3rd">3rd Grade</option>
                    <option value="4th">4th Grade</option>
                    <option value="5th">5th Grade</option>
                    <option value="6th">6th Grade</option>
                    <option value="7th">7th Grade</option>
                    <option value="8th">8th Grade</option>
                    <option value="9th">9th Grade</option>
                    <option value="10th">10th Grade</option>
                    <option value="11th">11th Grade</option>
                    <option value="12th">12th Grade</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bike Name
                  </label>
                  <input
                    type="text"
                    name="bikeName"
                    value={formData.bikeName}
                    onChange={handleInputChange}
                    placeholder="e.g., Mountain Bike, City Bike"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowAddForm(false)}
                    className="w-full"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={formLoading}
                    className="bg-brand-500 hover:bg-brand-600 text-white w-full"
                  >
                    {formLoading ? "Adding..." : "Add Ward"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
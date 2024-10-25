"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Constants for form options
const languages = [
  "Java", "Python", "JavaScript", "C++", "C#", "Go", "Kotlin", "Ruby", "Swift",
  "PHP", "TypeScript", "Rust", "Dart", "Scala", "Perl", "R", "Elixir",
  "Haskell", "Lua", "C", "MATLAB", "Shell",
];

const categories = [
  "Algorithm", "Data Structure", "Web Development", "Mobile Development", "Other"
];

const difficultyLevels = ["Beginner", "Intermediate", "Advanced"];

const usageTypes = ["Educational", "Utility", "Template", "Other"];

// Props interface for FormField component
interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: { target: { name: string; value: string } }) => void;
  maxWidth?: string;
  component?: typeof Input | typeof Textarea;
  options?: string[];
  ref?: React.RefObject<HTMLTextAreaElement>;
}

// Reusable FormField component
const FormField = ({ label, name, value, onChange, maxWidth, component: Component = Input, options }: FormFieldProps) => {
  if (options) {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-muted-foreground/80">
          {label}
        </label>
        <Select 
          value={value} 
          onValueChange={(newValue) => onChange({ target: { name, value: newValue } })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-muted-foreground/80">
        {label}
      </label>
      <Component
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 ${maxWidth}`}
      />
    </div>
  );
};

export default function AddSnippet() {
  const [formData, setFormData] = useState({
    title: "",
    language: "",
    code: "",
    description: "",
    tags: "",
    category: "",
    difficulty: "",
    usage: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = useCallback((e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const validateForm = useCallback(() => {
    const requiredFields = ['title', 'language', 'code', 'category', 'difficulty', 'usage'];
    const emptyFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (emptyFields.length > 0) {
      emptyFields.forEach(field => {
        toast.error(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty`);
      });
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    const tagsArray = formData.tags.split(",").map(tag => tag.trim()).filter(Boolean);

    try {
      const response = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, tags: tagsArray }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast.success("Snippet requested for review");
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to add snippet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full p-8">
      <h1 className="text-4xl font-bold mb-6">Add New Snippet</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          maxWidth="max-w-[15vw]"
        />
        <FormField
          label="Language"
          name="language"
          value={formData.language}
          onChange={handleInputChange}
          options={languages}
        />
        <FormField
          label="Code"
          name="code"
          value={formData.code}
          onChange={handleInputChange}
          maxWidth="max-w-[40vw]"
          component={Textarea}
        />
        <FormField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          maxWidth="max-w-[40vw]"
          component={Textarea}
        />
        <FormField
          label="Tags (comma-separated)"
          name="tags"
          value={formData.tags}
          onChange={handleInputChange}
          maxWidth="max-w-[20vw]"
        />
        <div className="flex gap-4 flex-wrap">
          <FormField
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            options={categories}
          />
          <FormField
            label="Difficulty"
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
            options={difficultyLevels}
          />
          <FormField
            label="Usage"
            name="usage"
            value={formData.usage}
            onChange={handleInputChange}
            options={usageTypes}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="submit"
            className="mt-4 hover:border hover:border-foreground hover:text-foreground hover:bg-transparent"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Snippet"}
          </Button>
        </div>
      </form>
    </div>
  );
}
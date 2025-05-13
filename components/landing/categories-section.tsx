import React from "react";
import Link from "next/link";
import { 
  Code, 
  PaintBucket, 
  LineChart, 
  FileText, 
  Smartphone, 
  VideoIcon, 
  Globe, 
  HeartPulse 
} from "lucide-react";

const categories = [
  {
    title: "Web Development",
    icon: <Code className="h-6 w-6" />,
    color: "bg-blue-100 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    count: 1240,
  },
  {
    title: "Design & Creative",
    icon: <PaintBucket className="h-6 w-6" />,
    color: "bg-purple-100 dark:bg-purple-900/20",
    textColor: "text-purple-600 dark:text-purple-400",
    count: 870,
  },
  {
    title: "Marketing",
    icon: <LineChart className="h-6 w-6" />,
    color: "bg-green-100 dark:bg-green-900/20",
    textColor: "text-green-600 dark:text-green-400",
    count: 650,
  },
  {
    title: "Writing & Translation",
    icon: <FileText className="h-6 w-6" />,
    color: "bg-yellow-100 dark:bg-yellow-900/20",
    textColor: "text-yellow-600 dark:text-yellow-400",
    count: 920,
  },
  {
    title: "Mobile Development",
    icon: <Smartphone className="h-6 w-6" />,
    color: "bg-red-100 dark:bg-red-900/20",
    textColor: "text-red-600 dark:text-red-400",
    count: 540,
  },
  {
    title: "Video & Animation",
    icon: <VideoIcon className="h-6 w-6" />,
    color: "bg-pink-100 dark:bg-pink-900/20",
    textColor: "text-pink-600 dark:text-pink-400",
    count: 310,
  },
  {
    title: "SEO & Digital Marketing",
    icon: <Globe className="h-6 w-6" />,
    color: "bg-indigo-100 dark:bg-indigo-900/20",
    textColor: "text-indigo-600 dark:text-indigo-400",
    count: 480,
  },
  {
    title: "Healthcare",
    icon: <HeartPulse className="h-6 w-6" />,
    color: "bg-teal-100 dark:bg-teal-900/20",
    textColor: "text-teal-600 dark:text-teal-400",
    count: 230,
  },
];

export function CategoriesSection() {
  return (
    <section className="py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              Explore Categories
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Find projects in your field of expertise or post jobs in any of our popular categories.
            </p>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link 
              href={`/categories/${category.title.toLowerCase().replace(/\s+/g, '-')}`} 
              key={index} 
              className="group block"
            >
              <div className="flex flex-col space-y-2 rounded-xl border p-6 transition-all duration-200 hover:shadow-md">
                <div className={`rounded-full ${category.color} p-2 w-fit ${category.textColor}`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold">{category.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.count} active projects
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
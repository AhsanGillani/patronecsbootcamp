import { MuiHeader } from "@/components/mui/MuiHeader";
import { MuiHero } from "@/components/mui/MuiHero";
import { MuiCategories } from "@/components/mui/MuiCategories";
import { MuiStats } from "@/components/mui/MuiStats";
import { MuiCourses } from "@/components/mui/MuiCourses";
import { MuiFooter } from "@/components/mui/MuiFooter";

const MuiIndex = () => {
  return (
    <div>
      <MuiHeader />
      <MuiHero />
      <MuiCategories />
      <MuiStats />
      <MuiCourses />
      <MuiFooter />
    </div>
  );
};

export default MuiIndex;
import { Box, Chip } from '@mui/material';

export interface Category {
  id: number;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onSelectCategory: (id: number | null) => void;
}

export default function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
      <Chip 
        label="Tous" 
        onClick={() => onSelectCategory(null)}
        variant={selectedCategory === null ? "filled" : "outlined"}
        color={selectedCategory === null ? "primary" : "default"}
        clickable
      />

      {categories.map((category) => (
        <Chip 
          key={category.id} 
          label={category.name} 
          onClick={() => onSelectCategory(category.id)}
          variant={selectedCategory === category.id ? "filled" : "outlined"}
          color={selectedCategory === category.id ? "primary" : "default"}
          clickable
        />
      ))}
    </Box>
  );
}
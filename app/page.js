'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Modal, Stack, TextField, Button, Select, MenuItem, InputAdornment, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { firestore } from '@/firebase';
import { collection, query, getDocs, getDoc, deleteDoc, doc, setDoc } from "firebase/firestore";


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'Inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = [];
    docs.forEach((doc) => {
      inventoryList.push({
        name: doc.id,
        ...doc.data(),
      });
    });
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const addItem = async (item) => {
    if (!item) return;

    const docRef = doc(collection(firestore, 'Inventory'), item);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + 1 });
    } else {
      await setDoc(docRef, { quantity: 1 });
    }

    await updateInventory();
  };

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'Inventory'), item);
    await deleteDoc(docRef);
    await updateInventory();
  };

  const updateItemQuantity = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'Inventory'), item);
    if (quantity === "REMOVE" || quantity === 0) {
      await deleteDoc(docRef);
    } else {
      await setDoc(docRef, { quantity });
    }
    await updateInventory();
  };

  useEffect(() => {
    updateInventory();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredInventory(inventory.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));
    } else {
      setFilteredInventory(inventory);
    }
  }, [searchQuery, inventory]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleGenerateRecipe = async () => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const recipe = await generateRecipe(searchQuery);
      setRecipe(recipe);
    } catch (error) {
      console.error('Error generating recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (name, quantity) => {
    if (quantity === "REMOVE") {
      await removeItem(name);
    } else {
      await updateItemQuantity(name, quantity);
    }
  };

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2} bgcolor="#2C3E50">
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left="50%"
          width={400}
          bgcolor="#87CEEB"
          border="1px solid #ABB7B7"
          boxShadow={24}
          p={4}
          display="flex"
          flexDirection="column"
          gap={3}
          sx={{ transform: "translate(-50%,-50%)" }}
        >
          <Typography variant="h6" color="#FFFFFF">Add Item</Typography>
          <Stack width="100%" direction="row" spacing={4}>
            <TextField
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              sx={{ bgcolor: "#FFFFFF", color: "#333" }}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
              sx={{ bgcolor: "#1ABC9C", color: "#FFFFFF" }}
            >
              ADD
            </Button>
          </Stack>
        </Box>
      </Modal>
      <Box width="100%" display="flex" justifyContent="flex-end" p={2} bgcolor="#87CEEB">
        <TextField
          variant="outlined"
          placeholder="Search inventory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 200, bgcolor: '#FFFFFF', color: '#333' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box display="flex" gap={2}>
        <Button variant="contained" onClick={handleOpen} sx={{ bgcolor: "#1ABC9C", color: "#FFFFFF", mb: 2 }}>
          Add New Item
        </Button>
        <Button variant="contained" onClick={handleGenerateRecipe} sx={{ bgcolor: "#FF6347", color: "#FFFFFF", mb: 2 }}>
          {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Recipe"}
        </Button>
      </Box>
      {recipe && (
        <Box
          border="1px solid #ABB7B7"
          p={2}
          display="flex"
          flexDirection="column"
          alignItems="center"
          bgcolor="#FFFFFF"
          width="300px"
          marginTop={2}
        >
          <Typography variant="h6" color="#333" textAlign="center">
            Recipe
          </Typography>
          <Typography variant="body1" color="#333" textAlign="left">
            {recipe}
          </Typography>
        </Box>
      )}
      <Box border="1px solid #ABB7B7" p={2} display="flex" flexDirection="column" alignItems="center">
        <Box width="800px" height="100px" bgcolor="#34495E" display="flex" justifyContent="center" alignItems="center" p={2}>
          <Typography variant="h4" color="#7832ff" textAlign="center" noWrap>
            Pantry Tracker App
          </Typography>
        </Box>
        <Stack width="500px" height="500px" spacing={2} overflow="auto" alignItems="center">
          {filteredInventory.map(({ name, quantity }) => (
            <Box
              key={name}
              width="100%"
              minHeight="120px" // Increased minHeight for more space
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              bgcolor="#FFFFFF"
              padding={2}
            >
              <Typography variant="h6" color="#333" textAlign="center" sx={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  type="number"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(name, e.target.value)}
                  sx={{ width: 60 }}
                  inputProps={{ min: 0 }}
                />
                <Button variant="contained" onClick={() => addItem(name)} sx={{ bgcolor: "#1ABC9C", color: "#FFFFFF", width: 70 }}>
                  ADD
                </Button>
                <Button variant="contained" onClick={() => removeItem(name)} sx={{ bgcolor: "#FF6347", color: "#FFFFFF", width: 70 }}>
                  REMOVE
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Container, Typography, Grid, Card, CardContent, CardMedia, IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Snackbar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import users from '@/services/demoStore';
import MyApplianceNavigation from '@/components/MyApplianceNavigation';
import { Appliance } from '@/types/appliance';

const types = ['refrigerator','washer','dryer','stove','oven','dishwasher','microwave'];

export default function ProfileAppliances(){
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [current, setCurrent] = useState<Appliance>({ id:'', name:'', type:'refrigerator', brand:'', model:'', serialNumber:'', purchaseDate:'', lastServiceDate:'', notes:'', imageUrl:'' });
  const [snack, setSnack] = useState('');

  useEffect(()=>{
    setAppliances(users[0].appliances);
  },[]);

  const handleAdd = () => { setCurrent({ id:'', name:'', type:'refrigerator', brand:'', model:'', serialNumber:'', purchaseDate:'', lastServiceDate:'', notes:'', imageUrl:'' }); setOpen(true); };
  const handleEdit = (a:Appliance) => { setCurrent(a); setOpen(true); };
  const handleDelete = (id:string) => { setAppliances(list=>list.filter(x=>x.id!==id)); setSnack('Deleted'); };
  const handleSave = () => {
    if(current.id){ setAppliances(list=>list.map(a=>a.id===current.id? current : a)); }
    else { setAppliances(list=>[...list, { ...current, id: String(Date.now()) }]); }
    setOpen(false); setSnack('Saved');
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>)=> { const {name,value} = e.target; setCurrent(c=>({ ...c, [name]: value })); };
  const onSelectImage = (e: React.ChangeEvent<HTMLInputElement>)=>{ const f=e.target.files?.[0]; if(f){ setCurrent(c=>({ ...c, imageUrl: URL.createObjectURL(f) })); } };

  return (
    <>
      <MyApplianceNavigation />
      <Container maxWidth="lg">
        <Box sx={{ mt:4, mb:3, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <Typography variant="h4" color="primary">My Appliances</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>Add Appliance</Button>
        </Box>
        <Grid container spacing={3}>
          {appliances.map(a=> (
            <Grid item xs={12} sm={6} md={4} key={a.id}>
              <Card>
                <CardMedia component="img" height="140" image={a.imageUrl} alt={a.name} />
                <CardContent>
                  <Typography gutterBottom variant="h6">{a.name || a.type}</Typography>
                  <Typography variant="body2" color="text.secondary">Brand: {a.brand}</Typography>
                  <Typography variant="body2" color="text.secondary">Model: {a.model}</Typography>
                </CardContent>
                <Box sx={{ display:'flex', justifyContent:'flex-end', p:1 }}>
                  <IconButton onClick={()=>handleEdit(a)}><EditIcon/></IconButton>
                  <IconButton onClick={()=>handleDelete(a.id)}><DeleteIcon/></IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={open} onClose={()=>setOpen(false)}>
          <DialogTitle>{current.id? 'Edit Appliance':'Add Appliance'}</DialogTitle>
          <DialogContent>
            <TextField select name="type" label="Appliance Type" fullWidth margin="normal" value={current.type} onChange={onChange}>
              {types.map(t=> <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField name="name" label="Name" fullWidth margin="normal" value={current.name} onChange={onChange}/>
            <TextField name="brand" label="Brand" fullWidth margin="normal" value={current.brand} onChange={onChange}/>
            <TextField name="model" label="Model" fullWidth margin="normal" value={current.model} onChange={onChange}/>
            <TextField name="serialNumber" label="Serial Number" fullWidth margin="normal" value={current.serialNumber} onChange={onChange}/>
            <TextField name="purchaseDate" label="Purchase Date" type="date" fullWidth margin="normal" InputLabelProps={{shrink:true}} value={current.purchaseDate} onChange={onChange}/>
            <TextField name="lastServiceDate" label="Last Service Date" type="date" fullWidth margin="normal" InputLabelProps={{shrink:true}} value={current.lastServiceDate} onChange={onChange}/>
            <TextField name="notes" label="Notes" fullWidth margin="normal" multiline rows={3} value={current.notes} onChange={onChange}/>
            <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={onSelectImage} />
            <Button variant="outlined" startIcon={<ImageIcon/>} onClick={()=>fileRef.current?.click()} fullWidth sx={{ mt:2 }}>{current.imageUrl? 'Change Image':'Select Image'}</Button>
            {current.imageUrl && <Box sx={{ mt:2, textAlign:'center' }}><img src={current.imageUrl} alt="selected" style={{maxWidth:'100%', maxHeight:200}}/></Box>}
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!snack} autoHideDuration={2000} onClose={()=>setSnack('')} message={snack} />
      </Container>
    </>
  );
}



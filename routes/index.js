const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const router = express.Router();
const flash = require('connect-flash');

router.get('/register', (req, res) => {
  res.render('register');
});  

router.post('/adminregister', async (req, res) => {
  const { username, password,role,email,phone } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.execute('INSERT INTO users (username, password,role,email,phone) VALUES (?, ?,?,?,?)', [username, hashedPassword,role,email,phone]);
  res.redirect('/admin-dashboard');
});

router.post('/register', async (req, res) => {
  const { username, password, email,phone} = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  await db.execute('INSERT INTO users (username, password,email,phone) VALUES (?, ?,?,?)', [username, hashedPassword,email,phone]);
  res.redirect('/register');
});



router.get('/',(req,res)=>{
    res.render('register');
})

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/register',
}), (req, res) => {
  const role = req.user.role;

  if (role === 'admin') {
    res.redirect('/admin-dashboard');
  } else if (role === 'police') {
    res.redirect('/police-dashboard');
  } else if (role === 'user') {
    res.redirect('/user-dashboard');
  } else {
    res.redirect('/register');
  }
});


router.get('/user-dashboard', isAuthenticated, (req, res) => {
  res.render('user-dashboard', { user: req.user });
  
});

router.get('/police-dashboard', isAuthenticated,  (req, res) => {
  res.render('police-dashboard', { user: req.user });
  
});

router.get('/admin-dashboard', isAuthenticated, (req, res) => {
  res.render('admin-dashboard', { user: req.user });
  
});

router.get('/allcomplaints',isAuthenticated,async (req,res)=>{
  try {
      const [rows] = await db.query('SELECT * FROM complaint');
      res.render('complaints', { users: rows });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
})

router.get('/allguardians',isAuthenticated,async (req,res)=>{
  try {
      const [rows] = await db.query('SELECT * FROM guardians');
      res.render('viewguardian', { guardians: rows });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
})

router.get('/allusers',isAuthenticated,async (req,res)=>{
  try {
      const [rows] = await db.query('SELECT * FROM users');
      res.render('allusers', { users: rows });
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    } 
})

router.get('/adminregister',isAuthenticated,(req,res)=>{
  res.render("admincreation");
})

router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.get('/addgaurdian',isAuthenticated,(req,res)=>{
  res.render('addgaurdian');
})

router.get('/myprofile', isAuthenticated, async (req, res) => {
  const username = req.user.username;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    const [count] = await db.query('SELECT COUNT(elaboration) AS count FROM complaint WHERE user_name = ?', [username]);
    
    // Debugging to see the structure of count
    console.log(count);

    // Ensure you access the 'count' key from the first object in the count array
    const num = count[0].count;

    console.log('Number of complaints:', num);

    if (rows.length > 0) {
      const user = rows[0]; // Assuming only one user is returned for the given username
      res.render('myprofile', { user, num });
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});



router.post('/complaint',async (req,res)=>{
    const { title, elaboration } = req.body;
    const username = req.user.username;
    console.log({title,elaboration});
    console.log(username);
    await db.execute('INSERT INTO complaint (title,elaboration,user_name) VALUES (?,?,?)',[title,elaboration,username]);
    res.redirect('/user-dashboard'); 
 
})
router.post('/addgaurdian',async (req,res)=>{
    const { name, phone,email,address} = req.body;
    const username = req.user.username;
    await db.execute('INSERT INTO guardians (name,phone,email,adresss,user_name) VALUES (?,?,?,?,?)',[name,phone,email,address,username]);
    res.redirect('/user-dashboard');
})
 

router.get('/view',isAuthenticated, async (req,res)=>{
  const username = req.user.username;
    try {
        const [rows] = await db.query('SELECT * FROM complaint where user_name = ?',[username]);
        res.render('complaints', { users: rows });
      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
});


router.get('/police',(req,res)=>{
  res.render("police");
})

router.get('/alert',isAuthenticated,async (req,res)=>{
  const username = req.user.username;
  try {
      const rows = await db.query('SELECT email FROM guardians where user_name = ?',[username]);
      const emails = rows[0].map(entry=>entry.email);
      res.render('sendmail',{emails,username});
    } catch (err) {
      console.error(err);
      res.status(500).send('Server Error');
    }
    
})

router.get('/viewguardian',isAuthenticated, async (req,res)=>{
  const username = req.user.username;
    try {
        const [rows] = await db.query('SELECT * FROM guardians where user_name = ?',[username]);
        res.render('viewguardian', { guardians: rows });
      } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
      }
});


router.get('/complaint',isAuthenticated, (req,res)=>{
    res.render('create-complaint');
});
  
router.get('/emergencyalerts',isAuthenticated,(req,res)=>{
  res.render('emergency-alerts');
})


router.post('/sendAlert', (req, res) => {
  const { username, latitude, longitude } = req.body;
  console.log("Received data:", username, latitude, longitude);
  if (!username || latitude == null || longitude == null) {
    console.error("Missing data:", { username, latitude, longitude });
    return res.status(400).send("Missing data");
}
  
  const query = 'INSERT INTO alerts (username, latitude, longitude) VALUES (?, ?, ?)';
  db.query(query, [username, latitude, longitude], (err, result) => {
      if (err) {
          console.error("Database error:", err);
          res.status(500).send("Error saving alert to database");
      } else {
          res.status(200).send("Alert saved successfully");
      }
  });
});

router.get('/counselling',isAuthenticated, (req,res)=>{
  res.render('counselling');
});

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); 
  }
  res.redirect('/register');
}

function ensureRole(role) {
  return (req, res, next) => {
    if (req.isAuthenticated() && req.user.role === role) {
      return next();
    }
    res.status(403).send('Access denied');
  };
}


module.exports = router;

import jsonwebtoken from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export const signup = async (req, res) => {
    const { email, password,username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const e = await prisma.users.findUnique({ where: { email } });
    if (e) {
        return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
        data: {
        email,
        username,
        password: hashedPassword,
        },
    });
    return res.status(201).json({ message: "User created successfully" });

};

export const login = async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jsonwebtoken.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ token });
  
}
  
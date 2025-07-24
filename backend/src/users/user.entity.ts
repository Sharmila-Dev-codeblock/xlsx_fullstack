import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class User{
    @PrimaryColumn()
    id: number;
    @Column()
    name:string;
    @Column()
    email:string;
}
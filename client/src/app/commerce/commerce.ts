import { Address, User } from '../account/account';

const MAX_N_PICTURES = 1;

export class Restaurant {
    id: string;
    name: string;
    description: string;
    categories: Category[];
    address: Address;
    image: any = { 'data': '', 'file': '' };
    created: string;
    updated: string;
    user: User;

    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            this.name = o.name;
            this.description = o.description;
            this.created = o.created;
            this.updated = o.updated;
            this.image = o.image;
            if (o.address) {
                this.address = o.address; // province_id, city_id
            }

            if (o.categories && o.categories.length > 0) {
                let cs = [];
                for (let c of o.categories) {
                    cs.push(new Category(c));
                }
                this.categories = cs;
            } else {
                this.categories = [];
            }

            if (o.user) {
                this.user = new User(o.user);
            } else {
                this.user = new User();
            }
        }
    }
}

export class Category {
    id: string;
    name: string;
    description: string;
    status: string;
    created: string;
    updated: string;
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            this.name = o.name;
            this.description = o.description;
            this.status = o.status;
            this.created = o.created;
            this.updated = o.updated;
        }
    }
}


export class Color {
    id: string;
    name: string;
    description: string;
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            this.name = o.name;
            this.description = o.description;
        }
    }
}

export class Style {
    id: string;
    name: string;
    description: string;
    status: string;
    created: string;
    updated: string;
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            this.name = o.name;
            this.description = o.description;
            this.status = o.status;
            this.created = o.created;
            this.updated = o.updated;
        }
    }
}

export class PriceRange {
    id: string;
    low: number;
    high: number;
    step: number;
    status: string;
    created: string;
    updated: string;
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            this.low = o.low;
            this.high = o.high;
            this.step = o.step;
            this.status = o.status;
            this.created = o.created;
            this.updated = o.updated;
        }
    }
}

export class Picture {
    id: string;
    name: string;
    description: string;
    index: number;
    image: any = { 'data': '', 'file': '' };
    width: number;
    height: number;
    product: any = { id: 1 };
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            this.name = o.name;
            this.description = o.description;
            this.image = o.image;
            this.width = o.width;
            this.height = o.height;
            if (o.product) {
                this.product = o.product;
            }
        }
    }
}

export class Product {
    id: string;
    name: string;
    description: string;
    year: string;
    status: string;
    currency: string;
    dimension: string;
    price: number;
    fpath: string; // default picture
    categories: Category[];
    color: Color;
    restaurant: Restaurant;
    pictures: any[];

    created: string;
    updated: string;
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            this.name = o.name;
            this.description = o.description;
            this.year = o.year;
            this.status = o.status;

            if (o.pictures && o.pictures.length > 0) {
                this.pictures = o.pictures;
            } else {
                let ps = [];
                for (let i = 0; i < MAX_N_PICTURES; i++) {
                    let pic = new Picture();
                    pic.index = i;
                    pic.product = { id: o.id };
                    ps.push(pic);
                }
                this.pictures = ps;
            }

            // this.pic = o.pic;
            this.dimension = o.dimension;
            this.price = o.price;
            this.currency = o.currency;
            this.fpath = o.fpath;

            if (o.categories && o.categories.length > 0) {
                const cs = [];
                for (let c of o.categories) {
                    cs.push(new Category(c));
                }
                this.categories = cs;
            } else {
                this.categories = [];
            }

            if (o.color) {
                this.color = new Color(o.color);
            }

            if (o.restaurant) {
                this.restaurant = new Restaurant(o.restaurant);
            }

            // if(o.style){
            //     this.style = o.style;
            // }
            this.created = o.created;
            this.updated = o.updated;
        }
    }
}

export class CartItem {
    quantity: number;
    product: any = { id: 1 };
    constructor(o?: any) {
        if (o) {
            this.quantity = o.quantity;
            if (o.product) {
                this.product = o.product;
            }
        }
    }
}

export class Cart {
    id: string;
    user: any = { id: 1 };
    items: CartItem[];
    created: string;
    updated: string;

    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            if (o.user) {
                this.user = o.user;
            }
            this.items = o.items;
            this.created = o.created;
            this.updated = o.updated;
        }
    }
}

export class Order {
    id: string;
    user: any = { id: 0, username: '' };
    restaurant: any = { id: 0 };
    items: OrderItem[];
    amount: string;
    currency: string = 'cad';
    status: string;
    created: string;
    updated: string;
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            if (o.user) {
                this.user = o.user;
            }
            if (o.restaurant) {
                this.restaurant = o.restaurant;
            }
            this.items = o.items;
            this.amount = o.amount;
            this.status = o.status;
            this.currency = o.currency;
            this.created = o.created;
            this.updated = o.updated;
        }
    }
}

export class OrderItem {
    id: string;
    order: any = { id: 1 };
    product: any = { id: 1, name: '', price: 0 };
    quantity: number;
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            if (o.order) {
                this.order = o.order;
            }
            if (o.product) {
                this.product = o.product;
                this.product.name = o.product_name; // From database
                this.product.price = o.price;
            }
            this.quantity = o.quantity;
        }
    }
}

export class FavoriteProduct {
    id: string;
    user: any = { id: 1 };
    ip: string;
    product: any = { id: 1 };
    created: string;
    updated: string;
    constructor(o?: any) {
        if (o) {
            this.id = o.id;
            if (o.user) {
                this.user = o.user;
            }
            this.ip = o.ip;
            if (o.product) {
                this.product = o.product;
            }
            this.created = o.created;
            this.updated = o.updated;
        }
    }
}

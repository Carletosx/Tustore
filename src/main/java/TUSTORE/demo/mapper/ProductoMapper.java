package TUSTORE.demo.mapper;

import TUSTORE.demo.model.Producto;
import TUSTORE.demo.payload.response.ProductoDto;
import TUSTORE.demo.payload.response.CategoriaDto;
import org.springframework.stereotype.Component;

@Component
public class ProductoMapper {

    public ProductoDto toDto(Producto producto) {
        if (producto == null) {
            return null;
        }
        ProductoDto dto = new ProductoDto();
        dto.setId(producto.getId());
        dto.setNombre(producto.getNombre());
        dto.setDescripcion(producto.getDescripcion());
        dto.setPrecio(producto.getPrecio());
        dto.setStock(producto.getStock());
        // imagenBase64 will be set in the controller

        if (producto.getCategoria() != null) {
            dto.setCategoria(new CategoriaDto(producto.getCategoria().getId(), producto.getCategoria().getNombre()));
        }
        return dto;
    }

    // You might need a toEntity method if you are mapping DTOs back to entities for updates
    // public Producto toEntity(ProductoDto dto) {
    //     if (dto == null) {
    //         return null;
    //     }
    //     Producto producto = new Producto();
    //     producto.setId(dto.getId());
    //     producto.setNombre(dto.getNombre());
    //     producto.setDescripcion(dto.getDescripcion());
    //     producto.setPrecio(dto.getPrecio());
    //     producto.setStock(dto.getStock());
    //     // Handle imagen (byte[]) if needed
    //     // Handle categoria (Categoria entity) if needed
    //     return producto;
    // }
}
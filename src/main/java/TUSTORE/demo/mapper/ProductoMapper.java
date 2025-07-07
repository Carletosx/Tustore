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
        

        if (producto.getCategoria() != null) {
            dto.setCategoria(new CategoriaDto(producto.getCategoria().getId(), producto.getCategoria().getNombre()));
        }
        return dto;
    }

}